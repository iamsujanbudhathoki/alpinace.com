# 🌐 Alpine Ace - Frontend Documentation

This document provides a comprehensive overview of the **Alpine Ace Frontend Web Application** (`alpineace.com`), including the technology stack, application architecture, environment configuration, and a detailed catalog of all public and administrative pages.

---

## 🚀 Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router)** | React framework offering hybrid static/server-side rendering, Edge routing, and automatic code-splitting. |
| **React 19** | Modern UI rendering library utilizing Server Components and React hooks. |
| **Tailwind CSS v4** | Utility-first CSS engine delivering a responsive, clean, and modern aesthetic. |
| **TipTap Editor** | Headless rich-text WYSIWYG editor for blog writing and policy document formatting. |
| **Lucide React** | Lightweight, modern icon set. |
| **Sonner** | Toast notification system for user and admin feedback. |
| **Embla Carousel** | Touch-friendly responsive carousels for trip highlights, reviews, and galleries. |
| **BProgress** | Subtle top loading progress bar on route transitions. |
| **Zod & React Hook Form** | Form validation with schema safety and interactive error states. |
| **Cloudflare Turnstile** | Modern, privacy-focused CAPTCHA alternative protecting booking and inquiry forms. |

---

## 🏛️ Routing Architecture

The application is structured using Next.js **Route Groups** to logically isolate the customer-facing marketing website from the internal administration portal:

```text
alpineace.com/app/
├── (marketing)/                # Customer-facing public website
│   ├── layout.tsx              # Marketing header, navigation, footer, & WhatsApp widget
│   ├── page.tsx                # Home page
│   ├── trekking/               # Trek packages & booking
│   ├── tours/                  # Tour packages & booking
│   ├── expeditions/            # Mountain expeditions & booking
│   ├── activities/             # Adventure activities
│   ├── blog/                   # Blog articles
│   ├── about/                  # About Us
│   ├── contact/                # Contact page
│   ├── book/                   # Custom trip planner
│   ├── privacy/                # Privacy policy
│   └── terms/                  # Terms & conditions
├── (admin)/                    # Content Management System (CMS)
│   └── admin/                  # Protected admin routes (JWT + Cookie authentication)
├── api/                        # API route handlers (e.g. LLM markdown handler)
├── layout.tsx                  # Global root layout (Fonts, SEO metadata, GTM, GA, TopLoader)
├── sitemap.ts                  # Dynamic XML sitemap generator
├── robots.ts                   # Search engine crawler instructions
├── manifest.ts                 # Web Application Manifest (PWA)
└── llms.txt & llms-full.txt    # LLM-friendly documentation for AI crawlers
```

---

## 📄 Complete List of Public (Marketing) Pages

| URL Route | Page Name | Description & Key Capabilities |
| :--- | :--- | :--- |
| `/` | **Home Page** | High-impact hero banner, search bar with quick filters, featured Himalayan treks, tours, climbing expeditions, key achievements/metrics, verified client testimonials, and latest blog guides. |
| `/about` | **About Us** | The story of Alpine Ace, mission, values, certifications, environmental sustainability pledges, and leadership team showcase. |
| `/trekking` | **Trekking Directory** | Complete catalog of trekking packages in Nepal (Everest, Annapurna, Langtang, Manaslu, etc.) with filters by region, difficulty, duration, and price. |
| `/trekking/[slug]` | **Trek Details** | Dynamic detail page for a specific trek: day-by-day itinerary with elevation profiles, included/excluded services, interactive FAQ, group tier pricing, image gallery, and quick inquiry modal. |
| `/trekking/[slug]/booking` | **Dedicated Trek Booking** | Dedicated multi-step booking page: departure date selector, group size selection, add-on options (e.g., porter, private room, helicopter return), and passenger contact details. |
| `/tours` | **Tours Directory** | Catalog of guided cultural, historical, wildlife, and sightseeing tours across Nepal, Bhutan, and Tibet. |
| `/tours/[slug]` | **Tour Details** | Comprehensive itinerary, inclusions/exclusions, accommodation standards, seasonal availability, and booking trigger. |
| `/tours/[slug]/booking` | **Dedicated Tour Booking** | Dedicated step-by-step reservation page for tour travelers. |
| `/expeditions` | **Expeditions Directory** | High-altitude 6000m, 7000m, and 8000m peak climbing expeditions (Mount Everest, Manaslu, Ama Dablam, Island Peak, Mera Peak, etc.). |
| `/expeditions/[slug]` | **Expedition Details** | Technical climbing grading, base camp logistics, acclimatization schedules, high-altitude gear checklists, and departure dates. |
| `/expeditions/[slug]/booking` | **Expedition Booking** | Specialized climbing booking form capturing mountaineering experience and customized climbing services. |
| `/activities/[slug]` | **Activity Landing Pages** | Dedicated pages for specific adventure styles (e.g., peak climbing, heli-skiing, white water rafting, scenic flights). |
| `/blog` | **Travel Blog & Guides** | Himalayan travel guides, altitude sickness prevention tips, packing checklists, and local cultural articles categorized with search. |
| `/blog/[slug]` | **Single Blog Article** | Clean typography, reading time estimate, published date, author information, social share buttons, and related article recommendations. |
| `/contact` | **Contact Us** | Interactive contact inquiry form, direct WhatsApp chat trigger, Kathmandu office address, Google Map embed, emergency phone numbers, and official email addresses. |
| `/book` | **Custom Trip Planner** | Customized itinerary request form allowing travelers to define custom routes, duration, budget, and travel preferences. |
| `/terms` | **Terms & Conditions** | Legally binding booking terms, deposit and payment schedules, cancellation/refund policies, travel insurance prerequisites, and liability disclaimers (editable via admin). |
| `/privacy` | **Privacy Policy** | Comprehensive GDPR and data privacy compliance statements covering cookie usage, data retention, and customer rights (editable via admin). |

---

## 🛡️ Complete List of Admin Dashboard Pages (`/admin`)

The administration area provides complete control over packages, leads, bookings, media, and site content.

| URL Route | Section | Description & Features |
| :--- | :--- | :--- |
| `/admin/login` | **Authentication** | Secure admin login with password authentication, brute-force rate limiting, and Cloudflare Turnstile bot verification. |
| `/admin` | **Main Dashboard** | Executive KPI summary: total active packages, pending bookings counter, new inquiries, revenue overview, and recent activity feed. |
| `/admin/treks` | **Trek Management** | Full list of trekking packages with search, status filters (Draft / Published), quick edit, duplicate, and delete actions. |
| `/admin/treks/create` | **Create Trek Package** | Comprehensive multi-tab creator: basic details, route highlights, day-by-day itinerary with elevations, tier-based group pricing, inclusions/exclusions, packing list, FAQs, and SEO meta tags. |
| `/admin/treks/[id]/edit` | **Edit Trek Package** | Edit existing trek itineraries, pricing, and media assets. |
| `/admin/tours` | **Tours Management** | List and search all guided tours. |
| `/admin/tours/create` | **Create Tour Package** | Dedicated creation wizard for tour packages. |
| `/admin/tours/[id]/edit` | **Edit Tour Package** | Modify tour schedules, itineraries, and rates. |
| `/admin/expeditions` | **Expeditions Management** | List all peak climbing expeditions. |
| `/admin/expeditions/create` | **Create Expedition** | Creator with mountaineering-specific fields (peak altitude, climbing grade, base camp support). |
| `/admin/expeditions/[id]/edit`| **Edit Expedition** | Modify mountaineering expedition details. |
| `/admin/bookings` | **Bookings Center** | Centralized booking dashboard: view customer submissions, trip dates, group sizes, calculated prices, and update status (`Pending`, `Confirmed`, `Cancelled`, `Completed`). |
| `/admin/inquiries` | **Inquiries & Leads** | Manage incoming customer inquiries from package pages and the contact form. Filter by unread status and view customer message history. |
| `/admin/categories` | **Category Taxonomy** | Manage destination regions and categories (e.g. Everest Region, Annapurna Region, Langtang). |
| `/admin/categories/ordering`| **Category Reordering**| Drag-and-drop / index ordering of categories to control their display sequence on the public website. |
| `/admin/activities` | **Activities Manager** | Add and manage adventure activity types associated with packages. |
| `/admin/blogs` | **Blog Articles List** | View published articles and drafts with view counters and publication dates. |
| `/admin/blogs/new` | **Write New Article** | Rich-text WYSIWYG editor (TipTap) supporting heading levels, inline images, embedded tables, blockquotes, and custom SEO slugs. |
| `/admin/blogs/[id]/edit` | **Edit Article** | Edit and update existing blog content. |
| `/admin/testimonials` | **Client Reviews** | Manage traveler testimonials, star ratings, country flags, and client avatars. |
| `/admin/teams` | **Team Members** | Manage company guides, mountaineers, and office leadership profiles. |
| `/admin/faqs` | **FAQ Management** | Create, edit, and organize frequently asked questions by category and package. |
| `/admin/media` | **Media Library** | Central asset manager directly integrated with Cloudflare R2: bulk image upload, preview, copy CDN URLs, and delete unused media. |
| `/admin/about` | **About Page Editor** | Manage content, statistics, mission statement, and images displayed on the public `/about` page. |
| `/admin/settings` | **Website Settings** | Global site configuration: company phone numbers, emergency lines, office email, social media links, and SEO verification tokens. |
| `/admin/settings/terms-and-conditions` | **Terms Editor** | Full rich-text editor to update live Terms & Conditions without code deployment. |
| `/admin/settings/privacy-policy` | **Privacy Editor** | Full rich-text editor to update live Privacy Policy without code deployment. |
| `/admin/notifications` | **Notifications Center**| Real-time alerts for incoming bookings and customer inquiries. |
| `/admin/audit-logs` | **Security Audit Logs** | Comprehensive security audit log tracking admin logins, IP addresses, package creation, and content updates. |

---

## ⚙️ Environment Variables Configuration (`.env.local`)

To run or deploy the frontend, configure the following variables:

```bash
# Backend REST API endpoint (Points to Kailash Cloud cPanel in production)
NEXT_PUBLIC_API_URL=https://api.alpineacetreks.com

# Canonical Website URL & Domain
NEXT_PUBLIC_SITE_URL=https://www.alpineacetreks.com
NEXT_PUBLIC_SITE_DOMAIN=www.alpineacetreks.com

# Branding
NEXT_PUBLIC_SITE_NAME=Alpine Ace Treks & Expeditions
NEXT_PUBLIC_SITE_SHORT_NAME=Alpine Ace
NEXT_PUBLIC_SITE_EMAIL=info@alpineacetreks.com
NEXT_PUBLIC_SITE_TAGLINE=Guided Himalayan Treks & High Altitude Expeditions

# Cloudflare Turnstile Bot Protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAEY838pGth9_p8lf

# Analytics & Tracking
NEXT_PUBLIC_GTM_ID=GTM-PSN45B6H
NEXT_PUBLIC_GA_ID=G-35E6ELH493

# Webmaster Verification (Optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
```

---

## 💻 Local Development Commands

Navigate to `alpineace.com`:
```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build

# Start production server locally
npm run start
```
