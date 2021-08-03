export function registerServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return new Promise<boolean>((resolve) => {
      navigator.serviceWorker.register('/service-worker.js');
      resolve(true);
    });
  } else {
    return Promise.reject(false);
  }
}
