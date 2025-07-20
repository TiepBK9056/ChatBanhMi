"use client";
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ChatBanhMi</title>
      </head>
      <body className="notranslate modern web active font-inter bg-background h-screen overflow-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}