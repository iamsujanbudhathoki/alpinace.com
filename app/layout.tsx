import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { TopLoaderProvider } from "@/components/ui/top-loader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from "sonner";
import { SettingsProvider } from "@/lib/settings-context";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.jpg`,
  image: `${siteConfig.url}/logo.jpg`,
  telephone: "+977 1 4700543",
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tridevi Marg, Thamel",
    addressLocality: "Kathmandu",
    postalCode: "44600",
    addressCountry: "NP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "27.714649",
    longitude: "85.310764",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Sunday",
    ],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://facebook.com/alpineacenepal",
    "https://instagram.com/alpineacenepal",
    "https://youtube.com/@alpineacenepal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground"
        suppressHydrationWarning
      >
        <SettingsProvider>
          <TopLoaderProvider>{children}</TopLoaderProvider>
          <Toaster richColors position="top-right" duration={3000} />
        </SettingsProvider>
      </body>
    </html>
  );
}
