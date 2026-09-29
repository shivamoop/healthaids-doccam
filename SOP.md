# Standard Operating Procedure (SOP)
## GRH DocCam – Field Expense & Receipt Capture System

**Document Version:** 1.0  
**Effective Date:** September 2026  
**System:** GRH DocCam Progressive Web App (PWA) & n8n Verification Engine  
**Access Portal:** [https://healthaids-doccam.vercel.app](https://healthaids-doccam.vercel.app)  

---

## 1. Purpose & Scope
This Standard Operating Procedure (SOP) defines the mandatory step-by-step process for all field staff and authorized personnel to record, verify, and submit business expenses, bills, and purchase receipts using the **GRH DocCam** application.

The application automatically:
- Tags every submission with verified GPS coordinates and device telemetry.
- Enforces strict live-capture policies (no pre-saved gallery uploads permitted).
- Automatically names files following the standard convention: `{FirstName}_{LastName}_{YYYY-MM-DD}.jpg`.
- Extracts receipt transaction dates using AI Vision.
- Directly archives files to organizational Google Drive and logs data in Google Sheets.
- Dispatches email alerts with receipt attachments for any prior-dated expenses.

---

## 2. Prerequisites & Access Requirements
1. **Device:** Any smartphone (iOS or Android) or laptop/tablet with an active camera and GPS/Location services enabled.
2. **Account:** An active, authorized `@healthaids.in` Google Workspace account.
3. **Network:** Active internet connection (Mobile 4G/5G or Wi-Fi).

---

## 3. Step-by-Step Operating Workflow

### Step 1: Accessing the Application & Installing the Shortcut (PWA)
1. Open your mobile browser (Safari on iOS or Chrome on Android).
2. Navigate to: `https://healthaids-doccam.vercel.app`
3. For one-tap instant access, install the app directly to your Home Screen:
   - **On iOS (Safari):** Tap the **Share icon (⎋)** at the bottom of the screen, scroll down, and select **Add to Home Screen (⊞)**, then tap **Add**.
   - **On Android (Chrome):** Tap the **Install Shortcut** banner or tap the browser menu (**⋮**) and choose **Install App** or **Add to Home Screen**.

> 📸 **Screenshot Placeholder 1: PWA Home Screen Banner & Installation**
> 
> ![Screenshot: PWA Add Shortcut to Home Screen banner and iOS/Android installation prompt](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Mobile browser showing GRH DocCam install banner 'Add Shortcut to Home Screen for instant 1-tap camera access' with Install Shortcut button.*

---

### Step 2: Employee Sign-In (Google Authentication)
1. Upon loading the app, the **GRH DocCam Login Screen** will appear displaying the official white GRH logo banner.
2. Tap the **Sign in with Google** button.
3. Select your authorized `@healthaids.in` account.
4. **Access Control:** If an unauthorized personal account (e.g. `@gmail.com`) is selected, access will be blocked with an *"Access Denied"* security alert.

> 📸 **Screenshot Placeholder 2: Login Screen with GRH Logo Banner**
> 
> ![Screenshot: Login screen featuring the all-white GRH company logo banner, sign-in instructions, and Google Sign-In button](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: GRH DocCam login card with dark theme background, all-white GRH logo banner at the top, instructions 'Please sign in with your @healthaids.in account', and official Google Sign-In button.*

---

### Step 3: Verifying GPS Location & Device Telemetry
1. Once logged in, the **Main Dashboard** appears.
2. The system automatically fetches:
   - **GPS Location:** Real-time coordinates and tagged physical address.
   - **Device Details:** Smartphone model/OS, browser type, and screen specs.
   - **Target Filename:** Previews your formatted filename (e.g., `Rahul_Sharma_2026-09-29.jpg`).
3. Ensure the GPS status indicator shows **green** (Location Acquired). If prompted by your browser, tap **Allow** for Location Permissions.

> 📸 **Screenshot Placeholder 3: Main Dashboard with GPS & Device Telemetry**
> 
> ![Screenshot: Main dashboard showing GPS Location card with green status dot, Device Details card, and target filename preview](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Dashboard view showing user profile at top header, GPS Location card displaying coordinates/address, Device Details card, auto-filename preview badge, and large camera scan button.*

---

### Step 4: Live Document & Receipt Scanning
1. Tap the large circular **Camera Button** on the dashboard.
2. The fullscreen live camera viewfinder opens with white alignment corner guides.
3. **Capture Rules:**
   - **Live Capture Only:** You must take a live photo of the physical receipt. Gallery uploads from device storage are strictly disabled.
   - Lay the receipt flat on a clean surface with adequate lighting.
   - Align all four edges of the receipt within the viewfinder frame.
   - Ensure the transaction date and total amount are sharp and legible.
4. Tap the **Shutter Button** (circular button at the bottom center).

> 📸 **Screenshot Placeholder 4: Fullscreen Camera Viewfinder with Guides & GRH Header**
> 
> ![Screenshot: Fullscreen live camera viewfinder showing document alignment corner guides, GRH logo top bar, and shutter button](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Camera scanning interface with document frame alignment corners, top bar featuring GRH logo and 'Live Scanner · 0 of 10' badge, camera switch icon, and round shutter button.*

---

### Step 5: Real-Time Processing & AI Date Verification
1. Immediately upon tapping the shutter, an in-viewfinder overlay will display:
   - *"Reading receipt & verifying date..."* with an animated spinner.
2. The backend automatically forwards the document to the automated verification workflow.
3. The AI Vision engine analyzes the receipt image to extract the transaction date, vendor name, and total amount.

> 📸 **Screenshot Placeholder 5: Real-Time Verification Spinner Overlay**
> 
> ![Screenshot: In-viewfinder processing overlay displaying spinner and 'Reading receipt & verifying date...' text](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Live camera screen showing semi-transparent dark overlay with cyan spinner and text 'Reading receipt & verifying date...' during AI evaluation.*

---

## 4. Verification Outcomes & Action Guidelines

### Case A: Expense Date is Today (Standard Approval)
- **Condition:** The receipt date matches today's date in IST.
- **System Action:**
  1. The receipt image is saved to the organizational Google Drive (`Expense submission` folder).
  2. The record is logged into the master Google Sheets audit spreadsheet.
- **User Interface:**
  - Viewfinder closes automatically.
  - Green confirmation toast displays: **"Your images has been succesfully uploaded"**.
  - Document appears in the *Uploaded Documents* history on your dashboard.

> 📸 **Screenshot Placeholder 6: Upload Success Toast & History Record**
> 
> ![Screenshot: Green success toast notification reading 'Your images has been succesfully uploaded' with document listed in history](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Dashboard displaying green success toast 'Your images has been succesfully uploaded' and recent uploads list showing filename, timestamp, and GPS address.*

---

### Case B: Expense Date is Prior to Today (Past Date Flagged)
- **Condition:** The receipt date is valid, but occurred before today's date.
- **System Action:**
  1. File is saved to Google Drive.
  2. File is logged into Google Sheets.
  3. An automated **Email Alert** is immediately dispatched to the supervisory agent/admin via Gmail:
     - **Subject:** `⚠️ GRH DocCam Alert: Past Expense Image Uploaded (YYYY-MM-DD)`
     - **Email Body:** Details employee name, filename, expense date vs submission date.
     - **Attachment:** The exact captured receipt image is **attached directly to the email**.
- **User Interface:**
  - Viewfinder closes and displays confirmation: **"Your images has been succesfully uploaded"**.

> 📸 **Screenshot Placeholder 7: Email Alert with Attached Receipt Image**
> 
> ![Screenshot: Gmail notification alert received showing past expense warning details and attached receipt image](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Gmail inbox view showing alert email from GRH DocCam Automated Expense System with past date notice and the captured receipt image attached.*

---

### Case C: Missing Date or Unreadable Receipt (Re-upload Required)
- **Condition:** The document date is missing, blurry, folded, or cut off by the camera frame.
- **System Action:** Upload is halted; file is rejected from Google Drive.
- **User Interface:**
  - The **Re-upload Required** alert modal pops up.
  - Explains: *"No date was found in the receipt image. Please re-upload the image properly with the date clearly visible."*
- **Action Required:**
  1. Read the capture tips in the orange box (avoid glare, focus on date, keep entire edges inside frame).
  2. Tap **[Re-upload Image]**.
  3. The camera viewfinder reopens immediately. Retake the photo ensuring the receipt date is sharp and clear.

> 📸 **Screenshot Placeholder 8: Re-upload Required Alert Modal**
> 
> ![Screenshot: Orange themed Re-upload Required modal with capture tips and Re-upload Image action button](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Alert modal with orange header 'Re-upload Required', subtitle 'Receipt Verification Alert', explanatory text, helpful capture tips box, and orange 'Re-upload Image' button.*

---

### Case D: Google Drive Upload Failure or Network Interruption
- **Condition:** Google Drive node error, quota limit, token refresh issue, or mobile network drop.
- **System Action:** Server discards temporary local file and prevents incomplete submissions.
- **User Interface:**
  - The **Something went wrong** alert modal appears with a red indicator.
  - Subtitle: *Google Drive Upload Failed*.
  - Message: *"Something went wrong uploading to Google Drive. Please re-upload your image."*
- **Action Required:**
  1. Check that your phone has an active Wi-Fi or cellular data connection.
  2. Tap **[Re-upload Image]**.
  3. Snap the photo again to retry the automated Google Drive upload.

> 📸 **Screenshot Placeholder 9: Something Went Wrong (Drive Failure) Alert Modal**
> 
> ![Screenshot: Red themed 'Something went wrong' modal with Google Drive Upload Failed subtitle and Re-upload Image button](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Error modal with crimson border, red warning icon, title 'Something went wrong', subtitle 'Google Drive Upload Failed', message asking user to re-upload, and red 'Re-upload Image' button.*

---

## 5. Multi-Page Batch Submissions (Up to 10 Pages)
When submitting invoices or bills containing multiple separate sheets:
1. Tap the shutter button for **Page 1**.
2. Tap the shutter button for **Page 2**, **Page 3**, up to **10 pages**.
3. Mini thumbnails populate in the bottom dock, and the counter updates (e.g. `2 of 10`).
4. Tap the green **Done (X) ✓** button to review thumbnails.
5. In the Review screen, verify telemetry and tap **Upload Documents**.
6. Each page is processed and uploaded as `{FirstName}_{LastName}_{YYYY-MM-DD}_{01}.jpg`.

> 📸 **Screenshot Placeholder 10: Multi-Page Thumbnail Strip & Review Screen**
> 
> ![Screenshot: Multi-page review modal displaying thumbnail tray, sequential filenames, and Upload button](INSERT_IMAGE_URL_OR_PATH_HERE)
> 
> *Alt description for screenshot: Review modal showing thumbnail strip of multiple captured pages, target filename list with sequential numbering (_01, _02), and primary Upload Documents button.*

---

## 6. Best Practices for Clear Receipt Captures
| Recommendation | Explanation |
| :--- | :--- |
| **Keep Date in Center** | AI Vision prioritizes transaction and invoice header dates; ensure this area is sharp. |
| **Avoid Glare** | Thermal paper receipts reflect flash and overhead fluorescent light; angle camera slightly if glare obscures numbers. |
| **Flatten Crumpled Paper** | Smooth out crumpled bills so line items and timestamps are not warped. |
| **Include All 4 Corners** | The automated system checks for complete document borders to authenticate original bills. |
| **No Pre-Saved Photos** | For internal compliance and audit verification, uploading images from your phone photo gallery is disabled. |

---

## 7. Troubleshooting & Support
- **Camera does not open:** Open your phone Settings → Safari/Chrome → Permissions → Enable **Camera Access**.
- **GPS stuck on "Detecting...":** Open phone Settings → Privacy & Security → Location Services → Turn ON and set to *"While Using App"*.
- **"Access Denied" error:** Confirm you are signed into Google using your official `@healthaids.in` credentials.
- **For Technical Assistance:** Contact the Internal Systems Admin or reply to your supervisor's alert thread.
