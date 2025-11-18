import rift from "@/lib/rift";

// Extend Window interface to include webpushr
declare global {
  interface Window {
    webpushr?: (command: string, ...args: any[]) => void;
  }
}

export interface NotificationSubscription {
  id: string;
  subscriberId: string;
  deviceInfo?: string;
  platform?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscriptionsData {
  subscriptions: NotificationSubscription[];
  activeCount: number;
  totalCount: number;
}

export class NotificationService {
  private isWebpushrReady = false;

  constructor() {
    this.waitForWebpushr();
  }

  /**
   * Ensure authentication token is set
   */
  private ensureAuthenticated(): boolean {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      console.error("❌ [Notifications] No authentication token found");
      return false;
    }
    rift.setBearerToken(authToken);
    return true;
  }

  /**
   * Wait for Webpushr to be ready
   */
  private async waitForWebpushr(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        console.warn(
          "NotificationService: Window is not available (SSR context)"
        );
        resolve();
        return;
      }

      // Check if webpushr is a function and callable
      if (typeof window.webpushr === "function") {
        // Test if it's actually working by checking if queue exists
        try {
          // Webpushr stores commands in a queue before initialization
          const webpushrObj = window.webpushr as any;
          if (webpushrObj.q || webpushrObj._isReady) {
            this.isWebpushrReady = true;
            console.log("✅ [Notifications] Webpushr is ready");
            resolve();
            return;
          }
        } catch (e) {
          console.warn("Webpushr function exists but may not be ready");
        }
      }

      // Listen for webpushr-ready event
      const handleReady = () => {
        this.isWebpushrReady = true;
        console.log("✅ [Notifications] Webpushr ready event fired");
        resolve();
      };

      window.addEventListener("webpushr-ready", handleReady, { once: true });

      // Also check periodically in case event was missed
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        if (typeof window.webpushr === "function") {
          this.isWebpushrReady = true;
          clearInterval(checkInterval);
          console.log("✅ [Notifications] Webpushr detected via polling");
          resolve();
        } else if (checkCount >= 20) {
          // 10 seconds timeout (20 * 500ms)
          clearInterval(checkInterval);
          console.warn(
            "⚠️ [Notifications] Webpushr initialization timeout - notifications may not work"
          );
          resolve();
        }
      }, 500);
    });
  }

  /**
   * Check if notifications are supported in this browser
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Get current browser notification permission
   */
  getPermission(): NotificationPermission | null {
    if (!this.isSupported()) return null;
    return Notification.permission;
  }

  /**
   * Enable notifications for the current user
   * @returns Object with success status and error details if applicable
   */
  async enableNotifications(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔔 [Notifications] Starting enable process...");

      // Ensure user is authenticated
      if (!this.ensureAuthenticated()) {
        return {
          success: false,
          error: "Please log in to enable notifications",
        };
      }

      // Ensure Webpushr is ready
      if (!this.isWebpushrReady) {
        console.log("⏳ [Notifications] Waiting for Webpushr to load...");
        await this.waitForWebpushr();
      }

      // Double-check Webpushr is actually available and callable
      if (!window.webpushr || typeof window.webpushr !== "function") {
        console.error(
          "❌ [Notifications] Webpushr still not available after waiting"
        );
        return {
          success: false,
          error:
            "Notification service failed to load. Please refresh the page and try again.",
        };
      }

      if (!this.isWebpushrReady) {
        return {
          success: false,
          error:
            "Notification service is not available. Please refresh the page and try again.",
        };
      }

      // Check if already subscribed
      const existingSubscriptions = await this.getSubscriptions();
      if (existingSubscriptions.activeCount > 0) {
        console.log("✅ [Notifications] User already has active subscriptions");
        return { success: true };
      }

      // Request permission through Webpushr
      const permissionResult = await this.requestPermission();

      if (permissionResult.denied) {
        console.log("⚠️ [Notifications] User denied notification permission");
        return {
          success: false,
          error:
            "You blocked notifications. To enable them, please allow notifications in your browser settings.",
        };
      }

      if (!permissionResult.granted) {
        console.log("⚠️ [Notifications] Permission not granted");
        return {
          success: false,
          error: "Notification permission was not granted. Please try again.",
        };
      }

      // Get subscriber ID from Webpushr
      const subscriberId = await this.getWebpushrSubscriberId();
      console.log("🔑 [Notifications] Subscriber ID obtained:", subscriberId);

      // Register with Rift
      const response = await rift.notifications.registerSubscription({
        subscriberId,
        deviceInfo: this.getDeviceInfo(),
        platform: this.getPlatform(),
      });

      if (response.success) {
        this.saveSubscriptionLocally(response.data?.subscription);
        console.log("✅ [Notifications] Enabled successfully!");
        return { success: true };
      }

      console.error(
        "❌ [Notifications] Failed to register subscription:",
        response.message
      );
      return {
        success: false,
        error:
          "Failed to register with notification service. Please try again.",
      };
    } catch (error: any) {
      console.error(
        "❌ [Notifications] Failed to enable notifications:",
        error
      );
      return {
        success: false,
        error:
          error?.message || "An unexpected error occurred. Please try again.",
      };
    }
  }

  /**
   * Request notification permission from the user
   */
  private async requestPermission(): Promise<{
    granted: boolean;
    denied: boolean;
  }> {
    // Check current permission state first
    const currentPermission = Notification.permission;

    if (currentPermission === "denied") {
      console.log("🚫 [Notifications] Permission already denied by user");
      return { granted: false, denied: true };
    }

    if (currentPermission === "granted") {
      console.log("✅ [Notifications] Permission already granted");
      return { granted: true, denied: false };
    }

    // Permission is "default" - need to request it
    console.log("🔔 [Notifications] Requesting permission via native API...");

    try {
      // Use native Notification API to request permission
      // This is more reliable than Webpushr's wrapper
      const permission = await Notification.requestPermission();
      console.log("🔔 [Notifications] Permission result:", permission);

      // After getting permission, subscribe via Webpushr if granted
      if (
        permission === "granted" &&
        window.webpushr &&
        typeof window.webpushr === "function"
      ) {
        try {
          // Register with Webpushr service
          await new Promise<void>((subscribeResolve) => {
            window.webpushr!("subscribe", () => {
              console.log(
                "✅ [Notifications] Webpushr subscription registered"
              );
              subscribeResolve();
            });
            // Don't wait forever for callback
            setTimeout(subscribeResolve, 3000);
          });
        } catch (error) {
          console.warn(
            "⚠️ [Notifications] Webpushr subscribe failed, but permission granted:",
            error
          );
          // Continue anyway - we have browser permission
        }
      }

      return {
        granted: permission === "granted",
        denied: permission === "denied",
      };
    } catch (error) {
      console.error("❌ [Notifications] Error requesting permission:", error);
      return { granted: false, denied: false };
    }
  }

  /**
   * Get the Webpushr subscriber ID
   */
  private getWebpushrSubscriberId(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.webpushr || typeof window.webpushr !== "function") {
        reject(new Error("Webpushr not available"));
        return;
      }

      try {
        window.webpushr("fetch_id", (sid: string) => {
          console.log(
            "🆔 [Notifications] Subscriber ID fetched:",
            sid ? "✓" : "✗"
          );
          if (sid) {
            resolve(sid);
          } else {
            reject(new Error("No subscriber ID available"));
          }
        });
      } catch (error) {
        console.error(
          "❌ [Notifications] Error fetching subscriber ID:",
          error
        );
        reject(error);
      }
    });
  }

  /**
   * Get all user subscriptions
   */
  async getSubscriptions(): Promise<UserSubscriptionsData> {
    try {
      if (!this.ensureAuthenticated()) {
        return { subscriptions: [], activeCount: 0, totalCount: 0 };
      }

      const response = await rift.notifications.getUserSubscriptions();
      console.log("📋 [Notifications] Subscriptions fetched:", response.data);
      return (
        response.data || { subscriptions: [], activeCount: 0, totalCount: 0 }
      );
    } catch (error) {
      console.error("❌ [Notifications] Failed to get subscriptions:", error);
      return { subscriptions: [], activeCount: 0, totalCount: 0 };
    }
  }

  /**
   * Unsubscribe a specific device
   */
  async unsubscribe(subscriberId: string): Promise<boolean> {
    try {
      if (!this.ensureAuthenticated()) {
        return false;
      }

      const response = await rift.notifications.unsubscribe(subscriberId);
      if (response.success) {
        console.log("✅ [Notifications] Successfully unsubscribed");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ [Notifications] Failed to unsubscribe:", error);
      return false;
    }
  }

  /**
   * Delete all user subscriptions
   */
  async deleteAllSubscriptions(): Promise<number> {
    try {
      if (!this.ensureAuthenticated()) {
        return 0;
      }

      const response = await rift.notifications.deleteAllSubscriptions();
      if (response.success && response.data) {
        console.log(
          `✅ [Notifications] Deleted ${response.data.deletedCount} subscriptions`
        );
        this.clearLocalSubscription();
        return response.data.deletedCount;
      }
      return 0;
    } catch (error) {
      console.error(
        "❌ [Notifications] Failed to delete subscriptions:",
        error
      );
      return 0;
    }
  }

  /**
   * Send a test notification
   */
  async sendTestNotification(
    subscriberId: string,
    message: string
  ): Promise<boolean> {
    try {
      if (!this.ensureAuthenticated()) {
        return false;
      }

      const response = await rift.notifications.sendTestNotification({
        subscriberId,
        title: "Test Notification",
        message,
        targetUrl: "https://wallet.riftfi.xyz/app",
      });

      const success = response.success ?? false;
      if (success) {
        console.log("✅ [Notifications] Test notification sent successfully");
      }
      return success;
    } catch (error) {
      console.error(
        "❌ [Notifications] Failed to send test notification:",
        error
      );
      return false;
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Detect browser
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    // Detect OS
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS")) os = "iOS";

    return `${browser} on ${os}`;
  }

  /**
   * Get platform type
   */
  private getPlatform(): string {
    return /mobile/i.test(navigator.userAgent) ? "mobile" : "web";
  }

  /**
   * Save subscription locally
   */
  private saveSubscriptionLocally(subscription: any) {
    if (subscription) {
      localStorage.setItem(
        "riftNotificationSubscription",
        JSON.stringify({
          id: subscription.id,
          subscriberId: subscription.subscriberId,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  /**
   * Clear local subscription data
   */
  private clearLocalSubscription() {
    localStorage.removeItem("riftNotificationSubscription");
  }

  /**
   * Get local subscription data
   */
  getLocalSubscription(): any | null {
    try {
      const data = localStorage.getItem("riftNotificationSubscription");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
