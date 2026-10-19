# ⚡ Vercel - Frontend Deployment & Domain Setup Guide

This guide provides step-by-step instructions for deploying the **Alpine Ace Frontend Web Application** (`alpineace.com`) to **Vercel** and linking it with the backend deployed on Kailash Cloud cPanel.

---

## 📋 Overview

The frontend is a **Next.js 16** application optimized for Vercel's Edge Network, featuring automatic global CDN caching, asset optimization, dynamic metadata rendering, and edge SSL.

---

## 🛠️ Step 1: Connect Your Git Repository to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your Git repository (GitHub, GitLab, or Bitbucket) containing the Alpine Ace project.

---

## ⚙️ Step 2: Configure Project Settings & Root Directory

1. In the **Configure Project** screen:
2. **Project Name:** `alpineace` (or `alpineacetreks-frontend`).
3. **Framework Preset:** Select **Next.js** (automatically detected).
4. **Root Directory:**
   - If the repository has both backend and frontend folders, click **Edit** next to Root Directory.
   - Select the frontend folder:
     ```text
     alpineace.com
     ```
   - Click **Continue**.
5. Leave **Build Command** (`next build`) and **Output Directory** (`.next`) at their defaults.

---

## 🔑 Step 3: Configure Production Environment Variables

Expand the **Environment Variables** accordion and add the following keys for **Production** and **Preview** environments:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://api.alpineacetreks.com` | **Critical:** Points frontend API requests to your Kailash Cloud cPanel backend. |
| `NEXT_PUBLIC_SITE_URL` | `https://www.alpineacetreks.com` | Canonical production URL for SEO & sitemaps. |
| `NEXT_PUBLIC_SITE_DOMAIN`| `www.alpineacetreks.com` | Primary production domain. |
| `NEXT_PUBLIC_SITE_NAME` | `Alpine Ace Treks & Expeditions` | Business display name. |
| `NEXT_PUBLIC_SITE_EMAIL`| `info@alpineacetreks.com` | Display contact email. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAAAAEY838pGth9_p8lf` | Cloudflare Turnstile public site key. |
| `NEXT_PUBLIC_GTM_ID` | `GTM-PSN45B6H` | Google Tag Manager Container ID. |
| `NEXT_PUBLIC_GA_ID` | `G-35E6ELH493` | Google Analytics 4 Measurement ID. |

---

## 🚀 Step 4: Deploy & Verify Build

1. Click the **Deploy** button.
2. Vercel will install dependencies, compile Tailwind CSS v4, generate static pages, and produce the production bundle.
3. Once completed, you will see the **Congratulations!** screen with your temporary Vercel preview domain (e.g., `alpineace.vercel.app`).
4. Click on the URL to verify that pages render cleanly.

---

## 🌐 Step 5: Custom Domain & DNS Setup

To link `www.alpineacetreks.com` and `alpineacetreks.com` to Vercel while keeping your backend `api.alpineacetreks.com` on Kailash Cloud:

### 1. Add Domains in Vercel
1. In your Vercel project, go to **Settings** -> **Domains**.
2. Enter:
   ```text
   alpineacetreks.com
   ```
3. Vercel will recommend adding both `alpineacetreks.com` and `www.alpineacetreks.com`, redirecting the apex domain (`alpineacetreks.com`) to `www.alpineacetreks.com`.
4. Click **Add**.

### 2. Configure DNS Records in Kailash Cloud cPanel (or Cloudflare / Registrar)
Open your DNS manager (e.g. cPanel -> **Zone Editor** or Cloudflare DNS) and configure the following records:

| Record Type | Name / Host | Target / Value | TTL | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A Record** | `@` (or `alpineacetreks.com`) | `76.76.21.21` | Automatic / 14400 | Points apex domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 14400 | Points www subdomain to Vercel |
| **A Record** | `api` | `[Kailash Cloud Server IP]` | Automatic / 14400 | **Keep this on Kailash Cloud** for the backend API |
| **CNAME** | `media` | `[Cloudflare R2 Public Domain]` | Automatic / 14400 | Points media subdomain to R2 bucket |

> [!IMPORTANT]
> Do NOT change the `api` record to Vercel. The `api.alpineacetreks.com` record must continue pointing to your Kailash Cloud cPanel IP address where the Node.js server is running.

---

## ✅ Step 6: End-to-End Post-Deployment Checklist

Once the DNS propagates (usually within 10–30 minutes):

1. **Homepage Check:** Visit `https://www.alpineacetreks.com`. Ensure hero banners, featured trips, and testimonials load with images.
2. **Package Detail Check:** Visit a trek page (e.g., `/trekking/everest-base-camp-trek`). Ensure itineraries, inclusions, and tier prices populate from the backend.
3. **Live Booking Test:** Complete a test booking via `/trekking/[slug]/booking`. Ensure:
   - The booking submits without CORS errors.
   - The confirmation screen is displayed.
   - Confirmation emails are received by both customer and admin.
4. **Admin Login:** Visit `https://www.alpineacetreks.com/admin/login`. Log in using your Super Admin credentials and ensure dashboard metrics, media library, and package editors function properly.
5. **SEO & Sitemaps:** Verify that `https://www.alpineacetreks.com/sitemap.xml` and `https://www.alpineacetreks.com/robots.txt` return valid XML and text respectively.
