/**
 * Auto-update utility for PWA
 * 
 * Checks for new versions and forces a hard refresh when needed.
 * This helps users who have cached old versions of the app.
 */

// Current app version - UPDATE THIS when deploying new versions
export const APP_VERSION = "1.0.1";

interface VersionInfo {
  version: string;
  buildTime: string;
  forceRefresh?: boolean;
}

/**
 * Clear all caches (service worker caches, browser caches)
 */
async function clearAllCaches(): Promise<void> {
  // Clear service worker caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }

  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );
  }

  // Clear IndexedDB databases (PWA caches)
  if ('indexedDB' in window && indexedDB.databases) {
    try {
      const databases = await indexedDB.databases();
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    } catch {
      // Some browsers don't support indexedDB.databases()
    }
  }
}

/**
 * Force a hard refresh of the page
 */
function forceHardRefresh(): void {
  // Store flag to prevent infinite refresh loop
  sessionStorage.setItem('just_refreshed', 'true');
  
  // Force reload from server, not cache
  window.location.reload();
}

/**
 * Check for updates and refresh if needed
 */
export async function checkForUpdates(): Promise<void> {
  // Prevent infinite refresh loop
  if (sessionStorage.getItem('just_refreshed') === 'true') {
    sessionStorage.removeItem('just_refreshed');
    return;
  }

  try {
    // Fetch version.json with cache-busting
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      return;
    }

    const serverVersion: VersionInfo = await response.json();
    const storedVersion = localStorage.getItem('app_version');

    // Check if we need to update
    const needsUpdate = 
      serverVersion.version !== APP_VERSION || 
      serverVersion.version !== storedVersion ||
      serverVersion.forceRefresh;

    if (needsUpdate) {
      // Clear all caches
      await clearAllCaches();
      
      // Store new version
      localStorage.setItem('app_version', serverVersion.version);
      
      // Force hard refresh
      forceHardRefresh();
    }
  } catch {
    // Network error - user might be offline, skip update check
  }
}

/**
 * Initialize auto-update checker
 * Call this in main.tsx
 */
export function initAutoUpdate(): void {
  // Check immediately on load
  checkForUpdates();

  // Also check periodically (every 5 minutes)
  setInterval(checkForUpdates, 5 * 60 * 1000);

  // Check when app becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  });
}

/**
 * Manual function to force clear cache and refresh
 * Can be called from settings or when user reports issues
 */
export async function forceClearCacheAndRefresh(): Promise<void> {
  localStorage.removeItem('app_version');
  await clearAllCaches();
  forceHardRefresh();
}
