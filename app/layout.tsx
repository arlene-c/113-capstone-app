import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASL Fingerspelling Detector',
  description: 'Detect American Sign Language fingerspelling with high accuracy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Madimi+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>      </head>
      <body>{children}</body>
    </html>
  );
}
