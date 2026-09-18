# HealthAids DocCam 📸

A Progressive Web App (PWA) designed for **HealthAids.in** team members to quickly capture documents and field photos with automated naming, telemetry tracking, and strict organizational Google authorization.

---

## ✨ Features

- **Google Authentication (`@healthaids.in`)**:
  - Integrated with Google Identity Services (`gsi/client`) using the HealthAids Google OAuth Client ID.
  - Domain-restricted: Only verified `@healthaids.in` accounts can sign in.
- **PWA Home Screen Shortcut**:
  - Installable directly to mobile home screens (iOS & Android) and desktop docks.
  - Standalone display mode with zero browser chrome/URL bars.
  - Custom themed icons (`#1eb8c9` and `#1a4578`).
- **Telemetry Capture**:
  - Automatically records high-accuracy GPS coordinates (latitude, longitude, accuracy radius in meters) and reverse geocoded city/locality.
  - Captures device specifications (OS, browser, screen resolution, connection type, platform).
- **1-Click Camera Viewfinder**:
  - High-contrast camera trigger opens a custom live viewfinder with document framing guidelines.
  - Supports rear camera (`facingMode: "environment"`) by default and front/rear camera flipping.
  - Fallback to native device camera file picker for older browsers.
- **Automated Document Naming**:
  - Automatically formats uploaded files as:
    ```
    {FirstName}_{LastName}_{YYYY-MM-DD}.jpg
    ```
  - Collision-safe: Automatically increments sequence suffix (e.g. `_01`, `_02`) if multiple documents are captured on the same date.
- **Vercel Serverless Ready**:
  - Includes `vercel.json` and memory storage pipeline for one-click deployment on Vercel.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the local server
npm start
# Server runs on http://localhost:3030
```

---

## 🌐 Deploy to Vercel

This repository includes a pre-configured `vercel.json` file ready for instant deployment:

```bash
# Deploy with Vercel CLI
vercel
```

---

## 🎨 Theme Palette
- **Primary Accent**: `#1eb8c9` (Cyan / Vibrant Teal)
- **Secondary Accent**: `#1a4578` (Deep Royal Navy)
- **Background**: `#070d17` & `#0c182a` (Sleek Dark Mode)
