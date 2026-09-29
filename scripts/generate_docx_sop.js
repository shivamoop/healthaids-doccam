const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');

// Helpers for clean typography
const NAVY = "1A4578";
const CYAN = "1EB8C9";
const DARK = "1E293B";
const MUTED = "64748B";
const BORDER_COLOR = "CBD5E1";

function p(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 120, after: options.after || 120, line: 276 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: options.size || 22, // 11pt
        color: options.color || DARK,
        bold: options.bold || false,
        italics: options.italics || false
      })
    ]
  });
}

function bullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + " ",
      font: "Calibri",
      size: 22,
      bold: true,
      color: DARK
    }));
  }
  children.push(new TextRun({
    text: text,
    font: "Calibri",
    size: 22,
    color: DARK
  }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 260 },
    children
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 32, // 16pt
        bold: true,
        color: NAVY
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 26, // 13pt
        bold: true,
        color: CYAN
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 24, // 12pt
        bold: true,
        color: DARK
      })
    ]
  });
}

// Helper to create a designated screenshot placeholder box
function screenshotBox(num, title, altText, guide) {
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
    left: { style: BorderStyle.SINGLE, size: 4, color: CYAN },
    right: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" }
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 180, right: 180 },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorder,
            shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 80, after: 60 },
                children: [
                  new TextRun({
                    text: `📸 SCREENSHOT PLACEHOLDER ${num}: ${title.toUpperCase()}`,
                    font: "Calibri",
                    bold: true,
                    size: 20, // 10pt
                    color: NAVY
                  })
                ]
              })
            ]
          })
        ]
      }),
      // Space for pasting screenshot
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorder,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 400, after: 80 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `[ PASTE SCREENSHOT ${num} HERE ]`,
                    font: "Calibri",
                    bold: true,
                    size: 24,
                    color: "94A3B8"
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 400 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `(Click here and press Ctrl+V / Cmd+V to insert image)`,
                    font: "Calibri",
                    italics: true,
                    size: 18,
                    color: "94A3B8"
                  })
                ]
              })
            ]
          })
        ]
      }),
      // Footer row with alt text and capture instructions
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorder,
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 40 },
                children: [
                  new TextRun({ text: "Alt Text: ", bold: true, size: 18, font: "Calibri", color: NAVY }),
                  new TextRun({ text: altText, italics: true, size: 18, font: "Calibri", color: DARK })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({ text: "Capture Guide: ", bold: true, size: 18, font: "Calibri", color: MUTED }),
                  new TextRun({ text: guide, size: 18, font: "Calibri", color: MUTED })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 140, after: 140 }, children: [] });
}

async function generateDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: DARK }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } // 1 inch
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "GRH DocCam – Standard Operating Procedure", font: "Calibri", size: 18, color: MUTED })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.SPACE_BETWEEN,
                children: [
                  new TextRun({ text: "Confidential – For Internal Field Personnel Only", font: "Calibri", size: 18, color: MUTED }),
                  new TextRun({ text: "   | Page ", font: "Calibri", size: 18, color: MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: MUTED }),
                  new TextRun({ text: " of ", font: "Calibri", size: 18, color: MUTED }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 18, color: MUTED })
                ]
              })
            ]
          })
        },
        children: [
          // TITLE BLOCK
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: "Standard Operating Procedure (SOP)", font: "Calibri", size: 44, bold: true, color: NAVY })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({ text: "GRH DocCam – Field Expense & Receipt Capture System", font: "Calibri", size: 28, bold: true, color: CYAN })
            ]
          }),

          // METADATA TABLE
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [p("Document Version", { bold: true, color: NAVY, size: 20 })]
                  }),
                  new TableCell({ children: [p("1.0 (Official Release)", { size: 20 })] }),
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [p("Effective Date", { bold: true, color: NAVY, size: 20 })]
                  }),
                  new TableCell({ children: [p("September 2026", { size: 20 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [p("System Platform", { bold: true, color: NAVY, size: 20 })]
                  }),
                  new TableCell({ children: [p("PWA + n8n Automated Engine", { size: 20 })] }),
                  new TableCell({
                    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                    children: [p("Access URL", { bold: true, color: NAVY, size: 20 })]
                  }),
                  new TableCell({ children: [p("https://healthaids-doccam.vercel.app", { size: 20, color: CYAN })] })
                ]
              })
            ]
          }),

          spacer(),

          // SECTION 1
          h1("1. Purpose & Scope"),
          p("This Standard Operating Procedure (SOP) defines the mandatory protocol for all authorized field staff, sales representatives, and medical personnel to capture, verify, and submit business expense receipts, fuel vouchers, meal bills, and purchase invoices using the GRH DocCam system."),
          p("The GRH DocCam solution ensures compliance and real-time auditability by:"),
          bullet("Automatic GPS & Telemetry Tagging: Every submission captures latitude, longitude, and physical location address at the moment of capture.", "•"),
          bullet("Strict Live-Photo Policy: Prevents pre-saved, downloaded, or gallery images from being submitted; receipts must be photographed live.", "•"),
          bullet("Standardized Filename Enforcement: Files are automatically named {FirstName}_{LastName}_{YYYY-MM-DD}.jpg.", "•"),
          bullet("AI Date Extraction: OpenRouter vision models parse the physical transaction date from the receipt in real time.", "•"),
          bullet("Automated Google Drive & Sheets Archival: Today's receipts are directly archived to the company Google Drive folder and logged into the master expense sheet.", "•"),
          bullet("Automated Past-Expense Alerts: Any receipt dated before today is automatically flagged and sent to the supervisor via Gmail with the receipt image attached.", "•"),

          spacer(),

          // SECTION 2
          h1("2. Prerequisites & Access Requirements"),
          bullet("Hardware: Smartphone (iOS 15+ Safari or Android 10+ Chrome) or tablet/laptop equipped with an operational camera and GPS location.", "1."),
          bullet("User Credentials: Valid, active Google Workspace account under the @healthaids.in organizational domain.", "2."),
          bullet("Connectivity: Stable internet connection (Mobile 4G/5G or Wi-Fi).", "3."),

          spacer(),

          // SECTION 3
          h1("3. Step-by-Step Operating Workflow"),

          h2("Step 1: Accessing the Portal & Installing the Shortcut (PWA)"),
          p("1. Open Safari on iOS or Chrome on Android and navigate to: https://healthaids-doccam.vercel.app"),
          p("2. To allow 1-tap direct launch from your home screen without opening browser tabs:"),
          bullet("iOS Safari: Tap the Share button at the bottom of the screen, scroll down, and tap 'Add to Home Screen', then tap 'Add'.", "•"),
          bullet("Android Chrome: Tap the banner 'Add Shortcut to Home Screen' or tap browser menu (⋮) and select 'Install App'.", "•"),
          spacer(),
          screenshotBox(
            1,
            "PWA Home Screen Installation Banner",
            "Screenshot: PWA Add Shortcut to Home Screen banner and iOS/Android installation prompt",
            "Open https://healthaids-doccam.vercel.app on your mobile browser. Capture the top installation banner reading 'Add Shortcut to Home Screen' and the install button."
          ),

          spacer(),

          h2("Step 2: User Sign-In (Google OAuth Security)"),
          p("1. The GRH DocCam login card will display the official white GRH logo banner."),
          p("2. Tap the 'Sign in with Google' button."),
          p("3. Select your authorized @healthaids.in organizational account."),
          p("4. Security Note: If any personal non-company account (e.g., @gmail.com) is selected, access will be blocked immediately with an 'Access Denied' notice."),
          spacer(),
          screenshotBox(
            2,
            "Sign-In Screen with GRH Logo Banner",
            "Screenshot: Login screen featuring the all-white GRH company logo banner, sign-in instructions, and Google Sign-In button",
            "Capture the login card displaying the all-white GRH logo banner at the top, instructions 'Please sign in with your @healthaids.in account', and the Google Sign-In button."
          ),

          spacer(),

          h2("Step 3: Location & Device Telemetry Verification"),
          p("1. Upon successful sign-in, the Main Dashboard loads."),
          p("2. The system automatically inspects and displays:"),
          bullet("GPS Location Card: Displays verified latitude/longitude coordinates and physical street address. The indicator dot turns green once locked.", "•"),
          bullet("Device Details Card: Details your phone operating system, browser, screen resolution, and connection type.", "•"),
          bullet("Target Filename Badge: Previews the auto-generated filename (e.g. Rahul_Sharma_2026-09-29.jpg).", "•"),
          p("3. If prompted by your browser for location permission, you must tap 'Allow While Using App'."),
          spacer(),
          screenshotBox(
            3,
            "Dashboard with GPS & Device Telemetry",
            "Screenshot: Main dashboard showing GPS Location card with green status dot, Device Details card, and target filename preview",
            "Capture the dashboard view showing your user profile in the header, green GPS Location card with resolved address, Device Details card, and target filename badge."
          ),

          spacer(),

          h2("Step 4: Live Document Scanning in Camera Viewfinder"),
          p("1. Tap the large circular Camera Button on the dashboard."),
          p("2. The fullscreen live camera viewfinder opens with corner alignment brackets."),
          p("3. Important Capture Guidelines:"),
          bullet("Live Photos Only: You cannot upload images saved in your photo gallery.", "•"),
          bullet("Lay the receipt completely flat on a dark or contrasting background.", "•"),
          bullet("Ensure the bill date, vendor name, and total amount are sharp and clearly legible.", "•"),
          bullet("Avoid glare or shadows over the receipt numbers.", "•"),
          p("4. Tap the Shutter Button (white circular button at bottom center) to take the photo."),
          spacer(),
          screenshotBox(
            4,
            "Camera Viewfinder with Alignment Guides",
            "Screenshot: Fullscreen live camera viewfinder showing document alignment corner guides, GRH logo top bar, and shutter button",
            "Capture the active camera screen showing document alignment corner brackets, the top bar with GRH logo and 'Live Scanner · 0 of 10', and the shutter button."
          ),

          spacer(),

          h2("Step 5: In-Camera Processing & AI Verification"),
          p("1. Immediately upon tapping the shutter, an animated overlay appears over the camera:"),
          bullet("'Reading receipt & verifying date...' with a rotating spinner.", "•"),
          p("2. The backend forwards the image to the automated n8n pipeline."),
          p("3. AI Vision models extract the invoice/bill date, vendor details, and transaction total."),
          spacer(),
          screenshotBox(
            5,
            "Real-Time Processing Overlay",
            "Screenshot: In-viewfinder processing overlay displaying spinner and 'Reading receipt & verifying date...' text",
            "Capture the viewfinder screen during snapshot processing showing the semi-transparent dark overlay, spinner, and 'Reading receipt & verifying date...' text."
          ),

          spacer(),

          // SECTION 4
          h1("4. Verification Outcomes & Action Rules"),

          h2("Case A: Expense Date is Today (Approved Automatically)"),
          p("Condition: The extracted receipt date matches today's calendar date in IST."),
          bullet("Document is uploaded to the organizational Google Drive ('Expense submission' folder).", "•"),
          bullet("Record is appended to Google Sheets ('October Expenses Record').", "•"),
          bullet("Camera closes and displays green toast: 'Your images has been succesfully uploaded'.", "•"),
          bullet("Document appears in the 'Uploaded Documents' audit list on your dashboard.", "•"),
          spacer(),
          screenshotBox(
            6,
            "Today's Expense Upload Confirmation",
            "Screenshot: Green success toast notification reading 'Your images has been succesfully uploaded' with document listed in history",
            "Capture dashboard with the green success confirmation toast 'Your images has been succesfully uploaded' and the uploaded document listed in recent history."
          ),

          spacer(),

          h2("Case B: Expense Date is Before Today (Past Expense Flagged)"),
          p("Condition: The receipt date is older than today's calendar date."),
          bullet("Document is archived into Google Drive and logged in Google Sheets.", "•"),
          bullet("An automated Email Alert is immediately sent to the supervisor via Gmail.", "•"),
          bullet("The email includes full employee details, dates, and the receipt image is attached directly.", "•"),
          bullet("User receives confirmation: 'Your images has been succesfully uploaded'.", "•"),
          spacer(),
          screenshotBox(
            7,
            "Email Alert with Attached Receipt Image",
            "Screenshot: Gmail notification alert received showing past expense warning details and attached receipt image",
            "Capture the received Gmail alert email showing subject '⚠️ GRH DocCam Alert: Past Expense Image Uploaded', the explanation, and the receipt image file attachment."
          ),

          spacer(),

          h2("Case C: Missing Date or Illegible Receipt (Re-upload Required)"),
          p("Condition: The receipt is blurry, folded, or the transaction date is missing."),
          bullet("Google Drive upload is halted; file is not saved.", "•"),
          bullet("The 'Re-upload Required' modal opens on screen.", "•"),
          bullet("Action: Review the capture tips, tap [Re-upload Image], and take a clearer photo.", "•"),
          spacer(),
          screenshotBox(
            8,
            "Re-upload Required Modal",
            "Screenshot: Orange themed Re-upload Required modal with capture tips and Re-upload Image action button",
            "Capture the modal displaying orange header 'Re-upload Required', subtitle 'Receipt Verification Alert', helpful capture tips box, and 'Re-upload Image' button."
          ),

          spacer(),

          h2("Case D: Google Drive Upload Failure or Network Drop"),
          p("Condition: Network dropout, Google Drive quota error, or service timeout."),
          bullet("Temporary file is deleted from server to prevent incomplete records.", "•"),
          bullet("The 'Something went wrong' modal appears on screen.", "•"),
          bullet("Action: Check network connection, tap [Re-upload Image], and snap the receipt again.", "•"),
          spacer(),
          screenshotBox(
            9,
            "Something Went Wrong (Drive Error) Modal",
            "Screenshot: Red themed 'Something went wrong' modal with Google Drive Upload Failed subtitle and Re-upload Image button",
            "Capture the error modal with red header 'Something went wrong', subtitle 'Google Drive Upload Failed', message asking user to re-upload, and red 'Re-upload Image' button."
          ),

          spacer(),

          // SECTION 5
          h1("5. Multi-Page Batch Submissions (Up to 10 Pages)"),
          p("For multi-page invoices or medical bills:"),
          p("1. Snap Page 1 using the shutter button."),
          p("2. Without closing the camera, snap Page 2, Page 3, up to 10 pages total."),
          p("3. The live thumbnail tray at the bottom will display each page snapped."),
          p("4. Tap the green 'Done (X) ✓' button to open the Snapshot Review Modal."),
          p("5. Review filenames and telemetry, then tap 'Upload Documents'."),
          p("6. Files are uploaded as {FirstName}_{LastName}_{Date}.jpg, {FirstName}_{LastName}_{Date}_01.jpg, etc."),
          spacer(),
          screenshotBox(
            10,
            "Multi-Page Review & Batch Upload Screen",
            "Screenshot: Multi-page review modal displaying thumbnail tray, sequential filenames, and Upload button",
            "Capture the review screen displaying multiple page thumbnails in the tray, sequential filenames list, and the primary 'Upload Documents' button."
          ),

          spacer(),

          // SECTION 6
          h1("6. Best Practices for Clear Receipt Captures"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: NAVY, type: ShadingType.CLEAR },
                    children: [p("Best Practice", { bold: true, color: "FFFFFF" })]
                  }),
                  new TableCell({
                    shading: { fill: NAVY, type: ShadingType.CLEAR },
                    children: [p("Operational Rationale", { bold: true, color: "FFFFFF" })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Center the Date & Total", { bold: true })] }),
                  new TableCell({ children: [p("AI Vision prioritizes transaction headers; keep dates in sharp focus.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Avoid Flash & Overhead Glare", { bold: true })] }),
                  new TableCell({ children: [p("Thermal receipts reflect direct light; tilt camera slightly to reduce glare.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Flatten Folded or Crumpled Paper", { bold: true })] }),
                  new TableCell({ children: [p("Smooth out paper folds before capturing to ensure text is undistorted.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Include Full Receipt Edges", { bold: true })] }),
                  new TableCell({ children: [p("Align all 4 receipt corners inside the viewfinder brackets for authentication.")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Live Photo Mandate", { bold: true })] }),
                  new TableCell({ children: [p("Uploading gallery photos is disabled to protect company audit integrity.")] })
                ]
              })
            ]
          }),

          spacer(),

          // SECTION 7
          h1("7. Troubleshooting & IT Support"),
          bullet("Camera Permission Denied: Open Phone Settings → Safari/Chrome → Permissions → Enable Camera Access.", "•"),
          bullet("GPS Location Timeout: Open Phone Settings → Privacy & Security → Location Services → Turn ON and select 'While Using App'.", "•"),
          bullet("Google Account Denied: Ensure you are logged into Chrome/Safari with your official @healthaids.in account.", "•"),
          bullet("Technical Support: For system inquiries or access troubleshooting, contact the IT Systems Administrator or your department manager.", "•")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // 1. Save in repository root
  const repoDocxPath = path.join(__dirname, '..', 'GRH_DocCam_SOP.docx');
  fs.writeFileSync(repoDocxPath, buffer);
  console.log('Saved DOCX file to repository:', repoDocxPath);

  // 2. Save in user Downloads folder for immediate 1-click opening
  const userDownloadsPath = '/Users/sam/Downloads/GRH_DocCam_SOP.docx';
  fs.writeFileSync(userDownloadsPath, buffer);
  console.log('Saved DOCX file to Downloads:', userDownloadsPath);
}

generateDocx().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
