import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Root HTML of the web build (rendered at build time only, never in the native app).
// Adds what makes the site installable as an app: manifest, iPhone home-screen tags, service worker.
const base = process.env.EXPO_BASE_URL ?? '';

const registerServiceWorker = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${base}/sw.js', { scope: '${base}/' }).catch(function (error) {
      console.error('Service worker registration failed', error);
    });
  });
}`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
        {/* Browser bar matches the app background (see src/ui/theme.ts) */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#F3F5F4" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0D1311" />
        <link rel="manifest" href={`${base}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${base}/icons/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="DailyFund" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
