import type { Metadata, Viewport } from 'next';
import { AppProviders } from './providers';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bricks AI Tycoon',
  description: 'Tap to earn, launch meme coins, STOP BEING POOR!',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}