import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
    weight: ["300", "400", "500", "600", "700", "800"], 
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://himalayanthakali.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Himalayan Thakali | Authentic Nepali Cuisine",
    template: "%s | Himalayan Thakali",
  },
  description:
    "Experience the authentic taste of the Himalayas with our traditional Thakali Thali and Nepali delicacies.",
  keywords: [
    "Thakali",
    "Nepali Restaurant",
    "Himalayan Food",
    "Authentic Thali",
    "Kathmandu Dining",
  ],
  authors: [{ name: "Himalayan Thakali Team" }],
  creator: "Himalayan Thakali",
  applicationName: "Himalayan Thakali",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "restaurant",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Himalayan Thakali",
    title: "Himalayan Thakali | Authentic Nepali Cuisine",
    description: "Experience the authentic taste of the Himalayas.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Himalayan Thakali Restaurant",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Himalayan Thakali",
    description: "Authentic Himalayan tastes delivered to your table.",
    images: ["/og-image.jpg"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E1E1E",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className=" font-inter antialiased bg-white text-slate-900">
        <ToastProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex flex-col min-h-screen">
            <main id="main-content" className="grow">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
