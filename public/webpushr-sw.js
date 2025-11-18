// Webpushr Service Worker
importScripts("https://cdn.webpushr.com/sw-server.min.js");

// Add notification click event listener to handle redirects
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Get the target URL from the notification data, default to /app
  const targetUrl =
    event.notification.data?.targetUrl || "https://wallet.riftfi.xyz/app";

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // If a window is already open, focus it and navigate
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ("focus" in client) {
            client.focus();
            // Navigate to the target URL
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              url: targetUrl,
            });
            return;
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle push events
self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  if (event.data) {
    const data = event.data.json();
    console.log("Push notification data:", data);

    const options = {
      body: data.message || "You have a new notification",
      icon: data.icon || "/rift.png",
      badge: "/rift.png",
      data: {
        targetUrl: data.targetUrl || "https://wallet.riftfi.xyz/app",
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Rift Wallet", options)
    );
  }
});
