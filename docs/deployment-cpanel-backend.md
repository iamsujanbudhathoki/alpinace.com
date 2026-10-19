# 🚀 Kailash Cloud cPanel - Node.js Backend Deployment & Redeployment Guide

This guide provides practical, step-by-step instructions for deploying and updating the **Alpine Ace Backend API** (`alpineace--backend`) on **Kailash Cloud cPanel Node.js Hosting** for `api.alpineacetreks.com`.

---

## ⚡ Quick Guide: How to Redeploy / Update the Backend

Follow this section whenever you make changes to backend code, routes, or templates and need to update production.

### Step 1: Log in to cPanel via Kailash Host Client Area
1. Go to the Kailash Host Client Area:
   🔗 [https://clients.kailashhost.com/clientarea.php](https://clients.kailashhost.com/clientarea.php)
2. In the **Active Products / Services** section, find and click **Node.js Hosting**.
3. In the **Actions** section on the right side, click **Login to cPanel**.

---

### Step 2: Open "Setup Node.js App" & Note the Environment Command
1. In cPanel, use the search bar at the top and search for **Setup Node.js App**. Click it.
2. In the applications list, locate the row for:
   ```text
   api.alpineacetreks.com
   ```
3. Click the **Edit (pencil icon)** button.
4. At the top of the page, you will see the **"Command for entering the virtual environment"**:
   ```bash
   source /home2/alpineac/nodevenv/apps/api.alpineacetreks.com/22/bin/activate && cd /home2/alpineac/apps/api.alpineacetreks.com
   ```
   > [!NOTE]
   > Keep this command handy. If you install new npm packages or need to run seed scripts, you will paste this into the cPanel Terminal.

---

### Step 3: Build the Backend Locally & Create Zip
1. In your local terminal, navigate to the backend directory:
   ```bash
   cd alpineace--backend
   ```
2. Run the production build command:
   ```bash
   npm run build
   ```
   *This compiles TypeScript into the `dist/` directory, compiles TSOA routes, and copies email templates.*
3. Create a zip archive containing the compiled build files:
   - **Linux / macOS:**
     ```bash
     cd dist && zip -r ../dist.zip . && cd ..
     ```
   - **Windows:** Open the `dist` folder, select all files and folders inside it, right-click &rarr; *Send to* &rarr; *Compressed (zipped) folder*, and name it `dist.zip` (placed in your `alpineace--backend` root).

---

### Step 4: Empty `src` Folder, Upload, Extract & Cleanup in File Manager
1. Return to the cPanel tab.
2. Use the search bar to search for and open **File Manager**.
3. In File Manager, navigate to the **`apps`** folder:
   ```text
   /home2/alpineac/apps/
   ```
4. Click into **`api.alpineacetreks.com`**, and then open the **`src`** folder:
   ```text
   /home2/alpineac/apps/api.alpineacetreks.com/src/
   ```
5. **Delete everything inside `src`**:
   - Inside the `src` folder, click **Select All** in the top toolbar.
   - Click **Delete** in the toolbar.
   - Check the box **"Skip the trash and permanently delete the files"** and confirm.
   - *Your `src` folder is now completely clean, preventing any stale or obsolete code from lingering.*
6. **Upload `dist.zip`**:
   - While still inside the empty `src` folder, click **Upload** in the top toolbar.
   - Select and upload your `dist.zip`.
7. **Extract (Export) the files**:
   - Once the upload reaches 100%, return to the `src` folder in File Manager.
   - Right-click `dist.zip` and select **Extract** (ensure extract path is `/home2/alpineac/apps/api.alpineacetreks.com/src`).
   - Click **Extract File(s)**. All new compiled files and folders are now unpacked directly inside `src`.
8. **Delete the zip file**:
   - Right-click `dist.zip` and select **Delete** (check *"Skip the trash"*).
   - Now only the clean, updated production files remain inside `src/`.

> [!TIP]
> If you modified `package.json` (e.g., added new dependencies), upload the updated `package.json` to the root `/home2/alpineac/apps/api.alpineacetreks.com/`.

---

### Step 5: (Optional) Install New Dependencies via cPanel Terminal
*Only needed if you installed new npm packages in `package.json`.*

1. In cPanel, search for **Terminal** under **Advanced** and open it.
2. Paste your virtual environment command:
   ```bash
   source /home2/alpineac/nodevenv/apps/api.alpineacetreks.com/22/bin/activate && cd /home2/alpineac/apps/api.alpineacetreks.com
   ```
3. Run:
   ```bash
   npm install --omit=dev
   ```

---

### Step 6: Restart the Application
1. Go back to cPanel -> **Setup Node.js App**.
2. Find `api.alpineacetreks.com` and click the **Restart** button (or inside the edit view, click **Restart Application**).
3. Test your live API in the browser or terminal:
   ```bash
   curl -I https://api.alpineacetreks.com/
   ```
   Or visit `https://api.alpineacetreks.com/` in your browser. You should receive:
   ```json
   {
     "status": "success",
     "message": "Alpine Ace Backend API is initialized and running!",
     "database": {
       "status": "connected",
       "isInitialized": true
     },
     "environment": "PRODUCTION"
   }
   ```

---

## 🛠️ Complete Server & Initial Setup Reference

Use this section for new server provisioning or reference configuration details.

### System Architecture
- **Provider:** Kailash Cloud (cPanel + CloudLinux)
- **Process Manager:** Phusion Passenger
- **Server User:** `alpineac`
- **Home Directory:** `/home2/alpineac`
- **Application Directory:** `/home2/alpineac/apps/api.alpineacetreks.com`
- **Node.js Version:** `22.x` (LTS)
- **Virtual Environment Path:** `/home2/alpineac/nodevenv/apps/api.alpineacetreks.com/22/`
- **Domain:** `https://api.alpineacetreks.com`

---

### Application Configuration in "Setup Node.js App"
When configuring the application in cPanel:
- **Node.js version:** `22.x`
- **Application mode:** `Production`
- **Application root:** `apps/api.alpineacetreks.com`
- **Application URL:** `api.alpineacetreks.com`
- **Application startup file:** `index.js`

### Root `index.js` Startup Bridge
Passenger loads `index.js` in the application root, which bootstraps the compiled server:
```javascript
/**
 * Alpine Ace Backend - Production Entry Point for cPanel / Phusion Passenger
 * This file serves as the default startup file for CloudLinux cPanel Node.js Selector.
 */
require('./dist/server.js');
```

---

### Production `.env` File Reference
Located at `/home2/alpineac/apps/api.alpineacetreks.com/.env`:

```bash
# Application Port & Mode
PORT=5001
NODE_ENV=PRODUCTION

# Database Connection (Local cPanel MySQL)
DATABASE_URL=mysql://alpineac_dbuser:YourPassword@localhost:3306/alpineac_backend
DB_SSL=false

# Security
JWT_SECRET=your_secure_random_64_character_string_here

# Mail Server Configuration (Gmail SMTP or Kailash Cloud Webmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=info@alpineacetreks.com
MAIL_PASSWORD=your_email_app_password
ADMIN_EMAIL=info@alpineacetreks.com

# Domain Whitelists (CORS)
FRONTEND_BASE_URL=https://www.alpineacetreks.com
BASE_URL=https://api.alpineacetreks.com
PUBLIC_URL=https://media.alpineacetreks.com

# Logging
LOG_LEVEL=info

# Cloudflare R2 Media Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=alpineace-media
R2_BACKUP_BUCKET_NAME=alpineace-db-backups
R2_PUBLIC_DOMAIN=https://media.alpineacetreks.com

# Cloudflare Turnstile Verification
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
TURNSTILE_ENABLED=true
```

---

## 🔍 Troubleshooting & Logs

### 1. 503 Service Unavailable / Passenger Startup Crash
- **Location of Error Log:**
  `/home2/alpineac/apps/api.alpineacetreks.com/stderr.log`
- Open this file in File Manager or run `cat stderr.log` in Terminal to see the exact stack trace causing the crash.

### 2. Changes Not Appearing After Upload
- Ensure you extracted the zip into `/home2/alpineac/apps/api.alpineacetreks.com/` and verified the `dist/` directory was replaced.
- Click **Restart** in the **Setup Node.js App** interface, or in Terminal run:
  ```bash
  mkdir -p /home2/alpineac/apps/api.alpineacetreks.com/tmp && touch /home2/alpineac/apps/api.alpineacetreks.com/tmp/restart.txt
  ```

### 3. Database Connection Errors
- Verify MySQL credentials in `/home2/alpineac/apps/api.alpineacetreks.com/.env`.
- Ensure host is set to `localhost` or `127.0.0.1`.
- Ensure database user has **ALL PRIVILEGES** granted in cPanel MySQL Databases.
