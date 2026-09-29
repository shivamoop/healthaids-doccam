# GRH DocCam – User Manual
### Official Operating Guide for Field Staff & Employees

**Application Name:** GRH DocCam  
**Access Portal:** [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app)  
**Version:** 3.0 (PWA & AI Vision Verification)  
**Target Audience:** Field Sales Executives, Managers, On-Site Staff, and Expense Approvers  
**Organization:** GRH / HealthAids  

---

## Table of Contents
1. [Introduction & Purpose](#1-introduction--purpose)
2. [Quick-Start Guide (3 Steps)](#2-quick-start-guide-3-steps)
3. [Installing the App to Your Home Screen (PWA)](#3-installing-the-app-to-your-home-screen-pwa)
   - [iPhone / iPad (iOS Safari)](#31-iphone--ipad-ios-safari)
   - [Android (Google Chrome)](#32-android-google-chrome)
4. [Signing In & Security](#4-signing-in--security)
5. [Tour of the Dashboard](#5-tour-of-the-dashboard)
6. [How to Scan Receipts & Documents](#6-how-to-scan-receipts--documents)
   - [Single-Page Receipts (Instant Capture)](#61-single-page-receipts-instant-capture)
   - [Multi-Page Invoices & Bills (Up to 10 Pages)](#62-multi-page-invoices--bills-up-to-10-pages)
7. [Behind the Scenes: AI Vision & Cloud Sync](#7-behind-the-scenes-ai-vision--cloud-sync)
8. [Screen Prompts & Alerts Guide](#8-screen-prompts--alerts-guide)
   - [🟢 Green Confirmation Toast (Success)](#81--green-confirmation-toast-success)
   - [🟡 Past Date Expense Alert (Supervisor Notified)](#82--past-date-expense-alert-supervisor-notified)
   - [🟠 Orange Modal: Re-upload Required (Missing / Blurry Date)](#83--orange-modal-re-upload-required-missing--blurry-date)
   - [🔴 Red Modal: Something Went Wrong (Google Drive / Network Error)](#84--red-modal-something-went-wrong-google-drive--network-error)
9. [Golden Rules for 100% Instant Approval](#9-golden-rules-for-100-instant-approval)
10. [Frequently Asked Questions (FAQ)](#10-frequently-asked-questions-faq)
11. [Troubleshooting & Permission Fixes](#11-troubleshooting--permission-fixes)
12. [Support & Helpdesk](#12-support--helpdesk)

---

## 1. Introduction & Purpose

**GRH DocCam** is an internal, mobile-first progressive web application engineered to make expense submission and receipt logging effortless for on-field staff.

### Key Capabilities:
- ⚡ **Instant Capture:** Open the camera and snap bills directly with zero setup.
- 📍 **Automatic Location & Timestamp:** Automatically tags real-time GPS coordinates, physical address, and device telemetry to prevent fraud.
- 🏷️ **Smart Naming:** Eliminates manual file naming by automatically saving files as `FirstName_LastName_YYYY-MM-DD.jpg`.
- 🤖 **AI Date Verification:** Automatically inspects receipt images to read transaction dates, vendors, and totals.
- ☁️ **Direct Cloud Filing:** Securely uploads your receipt directly to the company Google Drive (`Expense submission` folder) and logs records into the master Google Sheets audit tracker.

> [!NOTE]
> **Live-Capture Only Policy:** To maintain compliance with financial auditing standards, **uploading pre-existing photos from your smartphone's photo gallery is strictly disabled**. All bills must be snapped live using the in-app camera.

---

## 2. Quick-Start Guide (3 Steps)

If you are already logged in on your phone, submitting a receipt takes less than **10 seconds**:

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │ 1. Tap Camera Button │ ───► │ 2. Align & Snap Bill │ ───► │  3. Automatic Upload │
 │   (On Home Screen)   │      │ (Center Date & Total)│      │  (Google Drive Sync) │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

1. **Step 1 – Open the App:** Go to [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app) or tap the **GRH DocCam** icon on your phone's Home Screen.
2. **Step 2 – Snap the Receipt:** Tap the large circular camera button. Place your receipt within the 4 white corner guides and tap the round shutter button.
3. **Step 3 – Automatic Verification:** The AI analyzes the receipt date and uploads the document straight to Google Drive. When the green message *"Your images has been succesfully uploaded"* appears, you're finished!

---

## 3. Installing the App to Your Home Screen (PWA)

Installing GRH DocCam to your phone's home screen gives you a **full-screen app experience** (no browser URL bars) and instant 1-tap camera access from your home screen.

### 3.1. iPhone / iPad (iOS Safari)
> [!IMPORTANT]
> On Apple devices, you **must use Safari** to install the shortcut. Third-party browsers (Chrome, Edge) on iOS do not support home screen installation.

1. Open **Safari** and visit: [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app).
2. Tap the **Share icon** <kbd>⎋</kbd> (the square with an upward arrow) located in the bottom toolbar.
3. Scroll down the sharing menu and select **Add to Home Screen <kbd>⊞</kbd>**.
4. In the top-right corner of the confirmation dialog, tap **Add**.
5. The **GRH DocCam** icon will now appear on your iPhone home screen.

### 3.2. Android (Google Chrome)
1. Open **Google Chrome** and visit: [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app).
2. A blue top banner will appear reading **"Add Shortcut to Home Screen"**. Tap the **Install Shortcut** button.
3. If the banner does not appear, tap the **three dots menu <kbd>⋮</kbd>** in the top right corner of Chrome.
4. Select **Add to Home screen** or **Install app**.
5. Confirm by tapping **Install**. The **GRH DocCam** icon is now placed on your phone.

---

## 4. Signing In & Security

GRH DocCam is protected by Google Workspace enterprise authentication. Only registered company accounts are permitted.

```
       ┌────────────────────────────────────────────────────────┐
       │                      GRH DOCCAM                        │
       │                   [ GRH LOGO BANNER ]                  │
       │                                                        │
       │     Please sign in with your @healthaids.in account     │
       │                                                        │
       │               [ G Sign in with Google ]                │
       └────────────────────────────────────────────────────────┘
```

### Steps to Sign In:
1. On the login screen, tap the official **Sign in with Google** button.
2. Select your work email ending in `@healthaids.in`.
3. The app will greet you with a welcome message and load your personal dashboard.

### ⚠️ What if you see "Access Denied"?
- If you accidentally select a personal Google account (such as `@gmail.com` or `@yahoo.com`), the app will display:
  > **"Access Denied: (your_email@gmail.com) is not an authorized @healthaids.in account."**
- **How to resolve:** Refresh the page, tap **Sign in with Google**, and choose your official `@healthaids.in` corporate email.

---

## 5. Tour of the Dashboard

Once signed in, you have access to your primary operations center:

| Dashboard Card | Description | What You Should See |
| :--- | :--- | :--- |
| **Top Navigation Bar** | Displays the white GRH company logo, your profile picture, employee name, and the Logout button. | Verified profile banner |
| **GPS Location Card** | Automatically tags your current field position and calculates GPS accuracy (±meters). | Green status dot `●` with real-time address |
| **Device Details Card** | Captures phone model, mobile OS, browser version, and screen resolution. | Verified device specs |
| **Auto-Naming Tag** | Previews the exact file name your next photo will be saved under (e.g., `Rahul_Sharma_2026-09-29.jpg`). | Cyan badge above camera button |
| **Live Scanner Hero Button** | The large circular blue button that launches the camera. | Center of screen |
| **Uploaded Documents History** | Real-time table showing all receipts submitted today with timestamps, GPS locations, and status indicators. | Bottom of dashboard |

> [!TIP]
> Always verify that your **GPS Location card** displays a green status dot before snapping receipts. This guarantees that your location is attached to your expense audit.

---

## 6. How to Scan Receipts & Documents

### 6.1. Single-Page Receipts (Instant Capture)
This is the standard mode used for single taxi bills, fuel receipts, lunch invoices, and parking slips.

1. **Open Camera:** Tap the large circular camera button on the dashboard.
2. **Position Document:** Place the receipt flat on a dark or contrasting table. Align the 4 edges of the bill inside the **white corner framing guides**.
3. **Capture:** Tap the round **Shutter Button** at the bottom center.
4. **Instant Verification:** The in-viewfinder overlay will immediately show a cyan spinner reading:
   - *"Reading image & verifying expense date..."*
5. **Completion:** Within 2 to 4 seconds, the receipt is verified, filed into Google Drive, and the camera closes with a green success message:
   - **"Your images has been succesfully uploaded"**

---

### 6.2. Multi-Page Invoices & Bills (Up to 10 Pages)
For multi-sheet vendor contracts, hotel folios, or complex medical equipment invoices with multiple attached pages:

1. **Snap Page 1:** Tap the shutter button once. A small thumbnail of Page 1 will populate in the bottom dock.
2. **Snap Additional Pages:** Align Page 2 and tap the shutter. Align Page 3 and tap the shutter.
   - The top banner counter will update continuously: `Live Scanner · 3 of 10`.
   - You can capture up to **10 continuous pages** in a single session.
3. **Remove Mistaken Pages:** If a page was blurry, tap the small <kbd>✕</kbd> on its thumbnail in the bottom dock to discard just that page.
4. **Switch Cameras:** If needed, tap the camera flip button <kbd>🔄</kbd> in the top-right corner to alternate between rear and front cameras.
5. **Tap "Done ✓":** Once all pages are captured, tap the green **"Done (X) ✓"** button.
6. **Review Screen:**
   - Tap individual page tabs (`Page 1`, `Page 2`, `Page 3`) to inspect previews.
   - Verify the auto-generated sequential file names:
     - `Rahul_Sharma_2026-09-29.jpg` (Page 1)
     - `Rahul_Sharma_2026-09-29_01.jpg` (Page 2)
     - `Rahul_Sharma_2026-09-29_02.jpg` (Page 3)
   - Need another page? Tap **➕ Add Page**.
   - Made a mistake? Tap **Retake** to restart.
7. **Submit Batch:** Tap **Upload X Documents**. A live progress bar will track the upload until the batch is successfully archived.

---

## 7. Behind the Scenes: AI Vision & Cloud Sync

When you tap the shutter, GRH DocCam executes an automated sequence powered by enterprise cloud workflows:

```
  ┌─────────────────────────┐
  │   Live Photo Captured   │
  └───────────┬─────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │  AI Vision Engine       │ ──► Reads Receipt Date, Vendor Name, Total
  └───────────┬─────────────┘
              │
       ┌──────┴──────────────────────────────────────┐
       │                                             │
 [Date is Today]                             [Date is in Past]
       │                                             │
       ▼                                             ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│ 1. Upload Google Drive  │               │ 1. Upload Google Drive  │
│ 2. Log in Google Sheets │               │ 2. Log in Google Sheets │
│ 3. Green Success Toast  │               │ 3. Email Alert to Boss  │
└─────────────────────────┘               │    (Receipt Attached!)  │
                                          └─────────────────────────┘
```

1. **AI Vision Inspection:** OpenRouter vision models scan the image text in milliseconds to extract the formal billing date, vendor information, and grand total.
2. **Google Drive Archiving:** The file is converted to a secure JPEG and saved directly to the authorized corporate Google Drive folder (`Expense submission`).
3. **Audit Ledger Logging:** The transaction timestamp, employee email, GPS location, and verified amounts are recorded in Google Sheets (`October Expenses Record`).
4. **Automated Notification:** If the bill belongs to an earlier date, an email alert with the receipt image attached is sent to supervisory staff for compliance verification.

---

## 8. Screen Prompts & Alerts Guide

### 8.1. 🟢 Green Confirmation Toast (Success)
- **Message:** *"Your images has been succesfully uploaded"*
- **What it means:** The receipt date was validated, the image was accepted, and both Google Drive and Google Sheets records were updated successfully.
- **Action required:** None! Your document will appear in the *Uploaded Documents* table on your dashboard.

---

### 8.2. 🟡 Past Date Expense Alert (Supervisor Notified)
- **Condition:** The receipt date is genuine, but occurred before today (e.g., submitting a dinner bill from 3 days ago).
- **What happens:**
  - The receipt **still uploads normally** to Google Drive and Google Sheets.
  - The system dispatches an automated notification email via Gmail to the supervisory team:
    - **Subject:** `⚠️ GRH DocCam Alert: Past Expense Image Uploaded (YYYY-MM-DD)`
    - **Attachment:** A high-resolution copy of your captured receipt is attached to the email.
- **Action required:** None on your phone. If your manager has questions regarding delayed expense filing, they will reference the attached image in the email thread.

---

### 8.3. 🟠 Orange Modal: Re-upload Required (Missing / Blurry Date)
- **Title:** `Re-upload Required`
- **Subtitle:** `Receipt Verification Alert`
- **Message:** *"No date was found in the receipt image. Please re-upload the image properly with the date clearly visible."*
- **Why this happened:** The camera captured a photo where the date was obscured, cut off by the edge of the frame, washed out by camera flash, or folded.
- **Action required:**
  1. Check the 3 golden tips displayed in the orange box.
  2. Tap the orange **[Re-upload Image]** button.
  3. The camera opens instantly. Re-align the bill and make sure the date is sharp and centered before snapping again.

---

### 8.4. 🔴 Red Modal: Something Went Wrong (Google Drive / Network Error)
- **Title:** `Something went wrong`
- **Subtitle:** `Google Drive Upload Failed`
- **Message:** *"Something went wrong uploading to Google Drive. Please re-upload your image."*
- **Why this happened:** Your mobile phone lost signal during transmission, or the Google Drive cloud connection experienced a temporary timeout.
- **Action required:**
  1. Check that your smartphone has active 4G/5G mobile data or Wi-Fi.
  2. Tap the red **[Re-upload Image]** button.
  3. Retake the snapshot to re-trigger the upload.

---

## 9. Golden Rules for 100% Instant Approval

Follow these simple best practices to ensure your receipts pass AI verification on the first snap:

| Recommendation | Why It Matters |
| :--- | :--- |
| **Center the Date & Total** | The AI Vision engine focuses first on the header and footer of bills. Keep the date area crisp and in focus. |
| **Avoid Direct Flash on Thermal Paper** | Shiny supermarket and fuel receipts bounce flash directly into the lens, turning printed text completely white. Use ambient room light instead. |
| **Flatten Crumpled Receipts** | Smooth out folds and creases with your hand before scanning so numbers are not distorted. |
| **Keep All 4 Corners Inside the Frame** | Receipts cut off at the edge may have their invoice number or tax calculation truncated, leading to verification delays. |
| **Hold Still for 1 Second** | Wait for your phone's autofocus lens to settle before pressing the round shutter button to prevent motion blur. |

---

## 10. Frequently Asked Questions (FAQ)

### Q1: Why can't I select a photo from my phone's photo library or gallery?
> **Answer:** GRH DocCam enforces a **strict live-capture policy**. Financial audit guidelines require verified physical presence and real-time GPS metadata. Pre-saved photos from the gallery cannot be cryptographically verified for field presence.

### Q2: How are my files named?
> **Answer:** Files are automatically generated based on your corporate Google profile and the date of capture:
> - Single page: `FirstName_LastName_YYYY-MM-DD.jpg`
> - Multi-page: `FirstName_LastName_YYYY-MM-DD.jpg`, `FirstName_LastName_YYYY-MM-DD_01.jpg`, `..._02.jpg`.

### Q3: What is the maximum number of pages I can upload at once?
> **Answer:** You can scan up to **10 pages** in a single multi-page batch. If an invoice exceeds 10 pages, submit the first 10 pages, then scan the remaining pages in a second batch.

### Q4: Can I use the app while offline?
> **Answer:** The app requires an active internet connection (cellular 4G/5G or Wi-Fi) to perform live AI date verification and cloud archiving to Google Drive. If you are in a basement or area with no connectivity, move to an area with signal before scanning.

### Q5: Can I delete a receipt after it has been uploaded?
> **Answer:** Once an image is uploaded and confirmed with the green toast notification, it is securely archived in the corporate Google Drive repository and recorded on the Google Sheets ledger. To request a deletion or correction, please contact your finance department administrator.

### Q6: Why does the app request GPS / Location permissions?
> **Answer:** Location data confirms that business expenses (such as travel, meals, fuel, and client meetings) were incurred at legitimate field work locations.

---

## 11. Troubleshooting & Permission Fixes

### Issue 1: "Camera access denied" or Black Screen
- **iPhone / iOS Safari:**
  1. Open iPhone **Settings** > scroll down to **Safari** > tap **Camera**.
  2. Set Camera access to **Allow**.
  3. Return to Safari and refresh the web page.
- **Android / Chrome:**
  1. In Chrome, tap the **padlock / tune icon <kbd>🔒</kbd>** in the URL address bar.
  2. Tap **Permissions** > ensure **Camera** is set to **Allowed**.
  3. Refresh the page.

### Issue 2: Location Stuck on "Detecting GPS..."
- **iPhone:** Go to **Settings** > **Privacy & Security** > **Location Services** > ensure it is toggled **ON**, and Safari is set to *"While Using the App"*.
- **Android:** Pull down quick settings, ensure **Location** is toggled ON, and grant Chrome permission to access precise location.

### Issue 3: Logged Into Wrong Google Account
1. Tap the **Logout icon** <kbd>⎋</kbd> in the top right corner of the app header.
2. When the login screen reappears, tap **Sign in with Google**.
3. Select your official `@healthaids.in` corporate email.

### Issue 4: Updates Not Showing (Old Version Cached)
GRH DocCam updates automatically in the background. To force-refresh the latest app version:
- **On Safari:** Hold the refresh icon and select **Reload Without Content Blockers**, or clear Safari history for the site.
- **On Chrome:** Open Chrome menu <kbd>⋮</kbd> > **Settings** > **Privacy and security** > **Clear browsing data** (Cached images and files).

---

## 12. Support & Helpdesk

For technical issues, access escalations, or billing ledger inquiries, reach out to your internal IT & Operations team:

- **System Administrator:** GRH IT Systems Desk
- **Email:** `support@healthaids.in` / `admin@healthaids.in`
- **Application URL:** [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app)
- **Deployment Platform:** Vercel Production & n8n Automation Engine

---
*GRH DocCam · Built for Fast, Reliable Field Expense Automation · Version 3.0*
