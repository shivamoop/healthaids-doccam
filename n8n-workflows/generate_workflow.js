const fs = require('fs');
const path = require('path');

const workflow = {
  id: "hAidsDocCam2026",
  name: "HealthAids DocCam Expense Processor",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "healthaids-doccam",
        responseMode: "responseNode",
        options: {}
      },
      id: "webhook-doccam-entry",
      name: "DocCam Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [-400, 100],
      webhookId: "healthaids-doccam"
    },
    {
      parameters: {
        jsCode: `const item = $input.item;
const body = item.json.body || item.json;

const fileName = body.fileName || ("document_" + Date.now() + ".jpg");
const fileBase64 = body.fileBase64 || "";
const mimeType = body.mimeType || "image/jpeg";
const userEmail = (body.email || "user@healthaids.in").trim().toLowerCase();
const firstName = body.firstName || "Staff";
const lastName = body.lastName || "Member";
const fullName = body.fullName || (firstName + " " + lastName).trim();

// Clean base64 string
let cleanBase64 = fileBase64;
if (cleanBase64.includes("base64,")) {
  cleanBase64 = cleanBase64.split("base64,")[1];
}

const promptText = "You are an expert financial receipt, bill, and invoice date verification assistant for HealthAids.\\n" +
"Carefully examine this document/receipt image to locate the expense/bill/transaction date.\\n\\n" +
"Rules:\\n" +
"1. Check if a transaction date, invoice date, bill date, or purchase date is clearly legible on this document.\\n" +
"2. If found, format it strictly as YYYY-MM-DD (e.g. 2026-09-22).\\n" +
"3. If no date is found, or if the text is unreadable, cut off, or illegible, set date_found to false and expense_date to null.\\n" +
"4. Extract the total bill amount if visible.\\n" +
"5. Extract vendor or store name if visible.\\n\\n" +
"Return ONLY a valid JSON object matching this schema with NO markdown fences, no backticks:\\n" +
"{\\n" +
"  \\"date_found\\": true,\\n" +
"  \\"expense_date\\": \\"YYYY-MM-DD\\",\\n" +
"  \\"total_amount\\": \\"...\\",\\n" +
"  \\"vendor_name\\": \\"...\\",\\n" +
"  \\"confidence\\": \\"high\\",\\n" +
"  \\"reason\\": \\"...\\"\\n" +
"}";

return [{
  json: {
    fileName: fileName,
    fileBase64: cleanBase64,
    mimeType: mimeType,
    userEmail: userEmail,
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    location: body.location || null,
    deviceInfo: body.deviceInfo || null,
    prompt: promptText,
    imageUrl: "data:" + mimeType + ";base64," + cleanBase64
  }
}];`
      },
      id: "code-prepare-groq",
      name: "Prepare Groq Payload",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [-160, 100]
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: `Bearer ${process.env.GROQ_API_KEY || '{{ $env.GROQ_API_KEY }}'}`
            },
            {
              name: "Content-Type",
              value: "application/json"
            }
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: `={
  "model": "qwen/qwen3.8-27b",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": {{ JSON.stringify($json.prompt) }}
        },
        {
          "type": "image_url",
          "image_url": {
            "url": {{ JSON.stringify($json.imageUrl) }}
          }
        }
      ]
    }
  ],
  "response_format": { "type": "json_object" },
  "max_tokens": 512,
  "temperature": 0.1
}`,
        options: {}
      },
      id: "http-call-groq-vision",
      name: "Call Groq Vision",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [80, 100],
      retryOnFail: true,
      maxTries: 4,
      waitBetweenTries: 3000
    },
    {
      parameters: {
        jsCode: `const groqResponse = $input.item.json;
const originalData = $('Prepare Groq Payload').item.json;

let parsedAi = {};
try {
  const content = groqResponse.choices[0].message.content;
  parsedAi = typeof content === 'string' ? JSON.parse(content) : content;
} catch (e) {
  try {
    const raw = (groqResponse.choices && groqResponse.choices[0] && groqResponse.choices[0].message && groqResponse.choices[0].message.content) || '';
    const match = raw.match(/\\{[\\s\\S]*\\}/);
    if (match) parsedAi = JSON.parse(match[0]);
  } catch (err) {}
}

let dateFound = Boolean(parsedAi && parsedAi.date_found && parsedAi.expense_date);
let expenseDate = (parsedAi && parsedAi.expense_date) ? String(parsedAi.expense_date).trim() : null;

if (expenseDate) {
  // Normalize DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
  const dmyMatch = expenseDate.match(/^(\\d{1,2})[\\/\\-](\\d{1,2})[\\/\\-](\\d{4})$/);
  if (dmyMatch) {
    expenseDate = dmyMatch[3] + '-' + dmyMatch[2].padStart(2, '0') + '-' + dmyMatch[1].padStart(2, '0');
  }
}

// Current date in IST (Asia/Kolkata)
const now = new Date();
const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

let branchIndex = 0; // 0 = reupload, 1 = today, 2 = past
let status = 'REUPLOAD_REQUIRED';
let message = 'No date found in the receipt. Please re-upload the image properly with the date clearly visible.';

if (!dateFound || !expenseDate || !/^\\d{4}-\\d{2}-\\d{2}$/.test(expenseDate)) {
  branchIndex = 0;
  status = 'REUPLOAD_REQUIRED';
  message = 'No date found in the receipt. Please re-upload the image properly with the date clearly visible.';
  dateFound = false;
  expenseDate = null;
} else if (expenseDate === todayStr) {
  branchIndex = 1;
  status = 'SUCCESS';
  message = 'Your images has been succesfully uploaded';
} else {
  // Past expense (or date before today)
  branchIndex = 2;
  status = 'PAST_EXPENSE';
  message = 'Your images has been succesfully uploaded';
}

// Convert base64 buffer to binary data for Google Drive
const binaryBuffer = Buffer.from(originalData.fileBase64, 'base64');
const binaryData = await this.helpers.prepareBinaryData(
  binaryBuffer,
  originalData.fileName,
  originalData.mimeType
);

return [{
  json: {
    branchIndex: branchIndex,
    status: status,
    message: message,
    todayDate: todayStr,
    expenseDate: expenseDate,
    dateFound: dateFound,
    parsedAi: parsedAi,
    fileName: originalData.fileName,
    userEmail: originalData.userEmail,
    fullName: originalData.fullName,
    mimeType: originalData.mimeType
  },
  binary: {
    data: binaryData
  }
}];`
      },
      id: "code-evaluate-date",
      name: "Evaluate Date & Prepare File",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [320, 100]
    },
    {
      parameters: {
        mode: "expression",
        output: "={{ $json.branchIndex }}",
        numberOutputs: 3
      },
      id: "switch-route-by-date",
      name: "Route by Expense Date",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: [560, 100]
    },
    // Output 0: Re-upload required
    {
      parameters: {
        respondWith: "json",
        responseBody: `={
  "success": false,
  "status": "REUPLOAD_REQUIRED",
  "message": {{ JSON.stringify($json.message) }},
  "dateFound": false
}`,
        options: {
          responseCode: 422
        }
      },
      id: "webhook-respond-reupload",
      name: "Respond Reupload Required",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [840, -100]
    },
    // Output 1: Date is Today -> Upload to Google Drive
    {
      parameters: {
        authentication: "oAuth2",
        resource: "file",
        operation: "upload",
        inputDataFieldName: "data",
        name: "={{ $json.fileName }}",
        driveId: {
          mode: "list",
          value: "My Drive"
        },
        folderId: {
          mode: "list",
          value: "root"
        },
        options: {}
      },
      id: "gdrive-upload-today",
      name: "Google Drive Upload (Today)",
      type: "n8n-nodes-base.googleDrive",
      typeVersion: 3,
      position: [840, 100],
      credentials: {
        googleDriveOAuth2Api: {
          id: "9ShfEgfgrB9lm6hh",
          name: "Google Drive account"
        }
      }
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: `={
  "success": true,
  "status": "SUCCESS",
  "message": "Your images has been succesfully uploaded",
  "expenseDate": {{ JSON.stringify($('Evaluate Date & Prepare File').item.json.expenseDate) }},
  "isToday": true,
  "fileId": {{ JSON.stringify($json.id) }}
}`,
        options: {
          responseCode: 200
        }
      },
      id: "webhook-respond-today",
      name: "Respond Today Success",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1100, 100]
    },
    // Output 2: Date is Before Today (Past Expense) -> Upload to Google Drive -> Gmail Alert -> Respond
    {
      parameters: {
        authentication: "oAuth2",
        resource: "file",
        operation: "upload",
        inputDataFieldName: "data",
        name: "={{ $json.fileName }}",
        driveId: {
          mode: "list",
          value: "My Drive"
        },
        folderId: {
          mode: "list",
          value: "root"
        },
        options: {}
      },
      id: "gdrive-upload-past",
      name: "Google Drive Upload (Past)",
      type: "n8n-nodes-base.googleDrive",
      typeVersion: 3,
      position: [840, 300],
      credentials: {
        googleDriveOAuth2Api: {
          id: "9ShfEgfgrB9lm6hh",
          name: "Google Drive account"
        }
      }
    },
    {
      parameters: {
        sendTo: "={{ $('Evaluate Date & Prepare File').item.json.userEmail }}",
        subject: "={{ '⚠️ HealthAids Alert: Past Expense Image Uploaded (' + $('Evaluate Date & Prepare File').item.json.expenseDate + ')' }}",
        emailType: "text",
        message: "={{ 'Hello ' + $('Evaluate Date & Prepare File').item.json.fullName + ',\\n\\nNotice: The expense document you uploaded (' + $('Evaluate Date & Prepare File').item.json.fileName + ') has an expense date of ' + $('Evaluate Date & Prepare File').item.json.expenseDate + ', which is before today (' + $('Evaluate Date & Prepare File').item.json.todayDate + ').\\n\\nThe file has been saved to your Google Drive, but flagged as a past expense.\\n\\nThank you,\\nHealthAids Automated Expense System' }}",
        options: {
          appendAttribution: false
        }
      },
      id: "gmail-alert-past",
      name: "Gmail Alert to Agent",
      type: "n8n-nodes-base.gmail",
      typeVersion: 2.1,
      position: [1080, 300],
      credentials: {
        gmailOAuth2: {
          id: "yixMNuepWQtzlJbH",
          name: "Gmail account 5"
        }
      },
      continueOnFail: true
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: `={
  "success": true,
  "status": "PAST_EXPENSE",
  "message": "Your images has been succesfully uploaded",
  "expenseDate": {{ JSON.stringify($('Evaluate Date & Prepare File').item.json.expenseDate) }},
  "isToday": false,
  "alertSent": true
}`,
        options: {
          responseCode: 200
        }
      },
      id: "webhook-respond-past",
      name: "Respond Past Success",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1320, 300]
    }
  ],
  connections: {
    "DocCam Webhook": {
      main: [
        [
          {
            node: "Prepare Groq Payload",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Prepare Groq Payload": {
      main: [
        [
          {
            node: "Call Groq Vision",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Call Groq Vision": {
      main: [
        [
          {
            node: "Evaluate Date & Prepare File",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Evaluate Date & Prepare File": {
      main: [
        [
          {
            node: "Route by Expense Date",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Route by Expense Date": {
      main: [
        // Output 0 -> Reupload
        [
          {
            node: "Respond Reupload Required",
            type: "main",
            index: 0
          }
        ],
        // Output 1 -> Today
        [
          {
            node: "Google Drive Upload (Today)",
            type: "main",
            index: 0
          }
        ],
        // Output 2 -> Past
        [
          {
            node: "Google Drive Upload (Past)",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Google Drive Upload (Today)": {
      main: [
        [
          {
            node: "Respond Today Success",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Google Drive Upload (Past)": {
      main: [
        [
          {
            node: "Gmail Alert to Agent",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "Gmail Alert to Agent": {
      main: [
        [
          {
            node: "Respond Past Success",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  },
  settings: {
    executionOrder: "v1"
  },
  active: true
};

const outputPath = path.join(__dirname, 'healthaids_doccam_processor.json');
fs.writeFileSync(outputPath, JSON.stringify([workflow], null, 2));
console.log('Successfully generated workflow file at:', outputPath);
