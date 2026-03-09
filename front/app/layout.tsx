import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anakotmai = localFont({
  src: [
    {
      path: "../public/fonts/anakotmai-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/anakotmai-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/anakotmai-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-anakotmai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TidRod — Travel Map Community",
  description: "Share travel experiences on an interactive map. Discover places through fellow travelers, chat in real-time, and explore the world together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anakotmai.className} antialiased min-h-screen flex flex-col`}
      >
        <div className={'font-main flex flex-col h-screen'}>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
