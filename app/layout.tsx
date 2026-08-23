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

import { Toaster } from "sonner";
import { SettingsProvider } from "@/lib/settings-context";
import { SiteAnalytics, extractVerificationToken } from "@/components/common/site-analytics";
import { SettingService } from "@/lib/services/admin-service";

export async function generateMetadata(): Promise<Metadata> {
  let googleVerificationToken = "";
  try {
    const settings = await SettingService.getAll();
    if (settings?.googleSiteVerification) {
      googleVerificationToken = extractVerificationToken(settings.googleSiteVerification);
    }
  } catch (e) {
    // Ignore fetch error, fallback to defaults
  }

  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    alternates: {
      canonical: siteConfig.url,
      types: {
        "text/markdown": `${siteConfig.url}/llms.txt`,
      },
    },
    appleWebApp: {
      title: siteConfig.name,
    },
    ...(googleVerificationToken
      ? {
          verification: {
            google: googleVerificationToken,
          },
        }
      : {}),
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
      siteName: siteConfig.fullName,
      images: [
        {
          url: "/logo.jpg",
          width: 800,
          height: 600,
          alt: siteConfig.fullName,
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
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.fullName,
  alternateName: [...siteConfig.alternateNames],
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.jpg`,
  image: `${siteConfig.url}/logo.jpg`,
  description: siteConfig.description,
  telephone: siteConfig.telephone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    addressRegion: siteConfig.address.addressRegion,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.addressCountry,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: siteConfig.telephone,
      email: siteConfig.email,
      contactType: "customer service",
      availableLanguage: ["English", "Nepali"],
      areaServed: "Worldwide",
    },
  ],
  sameAs: [
    "https://facebook.com/alpineacenepal",
    "https://instagram.com/alpineacenepal",
    "https://youtube.com/@alpineacenepal",
  ],
};

const agencyJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "@id": `${siteConfig.url}/#agency`,
  name: siteConfig.fullName,
  alternateName: [...siteConfig.alternateNames],
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.jpg`,
  image: `${siteConfig.url}/logo.jpg`,
  telephone: siteConfig.telephone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    addressRegion: siteConfig.address.addressRegion,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.addressCountry,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: siteConfig.telephone,
      email: siteConfig.email,
      contactType: "customer service",
      availableLanguage: ["English", "Nepali"],
      areaServed: "Worldwide",
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agencyJsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground"
        suppressHydrationWarning
      >
        <SettingsProvider>
          <SiteAnalytics />
          <TopLoaderProvider>{children}</TopLoaderProvider>
          <Toaster richColors position="top-right" duration={3000} />
        </SettingsProvider>
      </body>
    </html>
  );
}
