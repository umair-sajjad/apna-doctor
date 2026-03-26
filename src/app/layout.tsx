import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ApnaDoctor - AI-Powered Healthcare Booking in Pakistan",
  description:
    "Find and book verified PMDC-registered doctors across Pakistan. AI-powered search in Urdu and English, instant booking, automated reminders. Your trusted healthcare partner.",
  keywords: [
    "doctor appointment Pakistan",
    "online doctor booking",
    "PMDC verified doctors",
    "healthcare Pakistan",
    "book doctor online",
    "medical appointment",
    "Lahore doctors",
    "Karachi doctors",
    "Islamabad doctors",
  ],
  authors: [{ name: "ApnaDoctor Team" }],
  creator: "ApnaDoctor",
  publisher: "ApnaDoctor",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://apnadoctor.pk",
    title: "ApnaDoctor - Book Doctors Online in Pakistan",
    description:
      "Find verified doctors, book appointments instantly, get SMS reminders. Pakistan's most trusted healthcare booking platform.",
    siteName: "ApnaDoctor",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApnaDoctor - Book Doctors Online",
    description: "Find and book verified doctors across Pakistan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
