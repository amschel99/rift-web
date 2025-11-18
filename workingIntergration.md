did have this file called "public/webpushr-sw.js"
having this content : 
```
importScripts("https://cdn.webpushr.com/sw-server.min.js");
```

also had this  at public/sw.js
```js
// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id,
        url: data.url || "/",
      },
      actions: [
        {
          action: "explore",
          title: "View Transaction",
          icon: "/images/checkmark.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/images/xmark.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    // Open the app to specific transaction
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.action === "close") {
    // Just close the notification
    return;
  } else {
    // Default click behavior
    event.waitUntil(clients.openWindow("/"));
  }
});
```