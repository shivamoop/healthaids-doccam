import subprocess
import urllib.request
import urllib.error
import json
import os
import sqlite3

def get_n8n_api_key():
    db_path = os.path.expanduser("~/.n8n/database.sqlite")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("SELECT apiKey FROM user_api_keys WHERE label = 'antigravity' LIMIT 1")
        row = c.fetchone()
        if row:
            return row[0]
    return os.environ.get("N8N_API_KEY", "")

API_KEY = get_n8n_api_key()
BASE_URL = "http://127.0.0.1:5678/api/v1/workflows/nsQOezpd5Nkptu04"

# 1. Load the canonical 16-node workflow from git HEAD
raw_git = subprocess.check_output(["git", "show", "HEAD:n8n-workflows/healthaids_doccam_processor.json"]).decode()
canonical_data = json.loads(raw_git)
wf = canonical_data[0] if isinstance(canonical_data, list) else canonical_data

print(f"Loaded canonical workflow from HEAD: {wf.get('name')} with {len(wf.get('nodes', []))} nodes")

prepare_groq_code = r"""const item = $input.item;
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

const promptText = "You are an expert financial receipt, bill, and invoice date verification assistant for HealthAids.\n" +
"Carefully examine this document/receipt image to locate the expense/bill/transaction date.\n\n" +
"Rules:\n" +
"1. Check if a transaction date, invoice date, bill date, or purchase date is clearly legible on this document.\n" +
"2. If found, format it strictly as YYYY-MM-DD (e.g. 2026-09-30).\n" +
"3. If no date is found, or if the text is unreadable, cut off, or illegible, set date_found to false and expense_date to null.\n" +
"4. Extract the total bill amount if visible.\n" +
"5. Extract vendor or store name if visible.\n\n" +
"IMPORTANT: Keep reasoning as concise as possible, and output ONLY a valid JSON object matching this schema with NO markdown fences, no backticks:\n" +
"{\n" +
"  \"date_found\": true,\n" +
"  \"expense_date\": \"YYYY-MM-DD\",\n" +
"  \"total_amount\": \"...\",\n" +
"  \"vendor_name\": \"...\",\n" +
"  \"confidence\": \"high\",\n" +
"  \"reason\": \"...\"\n" +
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
}];"""

evaluate_date_code = r"""const groqResponse = $input.item.json;
const originalData = $('Prepare Groq Payload').item.json;

let parsedAi = {};
const choice = (groqResponse.choices && groqResponse.choices[0]) || {};
const messageObj = choice.message || {};
const content = messageObj.content || '';
const reasoning = messageObj.reasoning || (messageObj.reasoning_details && messageObj.reasoning_details[0] && messageObj.reasoning_details[0].text) || '';

// 1. Try parsing JSON from content
if (typeof content === 'object' && content !== null) {
  parsedAi = content;
} else if (typeof content === 'string' && content.trim()) {
  try {
    parsedAi = JSON.parse(content.trim());
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsedAi = JSON.parse(match[0]); } catch (err) {}
    }
  }
}

// 2. Fallback: If not parsed or no expense_date, inspect reasoning text
if (!parsedAi || !parsedAi.expense_date) {
  if (typeof reasoning === 'string' && reasoning.trim()) {
    const rMatch = reasoning.match(/\{[\s\S]*"expense_date"[\s\S]*\}/);
    if (rMatch) {
      try {
        const candidate = JSON.parse(rMatch[0]);
        if (candidate && candidate.expense_date) {
          parsedAi = Object.assign({}, parsedAi, candidate);
        }
      } catch (err) {}
    }
    if (!parsedAi || !parsedAi.expense_date) {
      const expDateMatch = reasoning.match(/expense_date["\s:]+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      if (expDateMatch) {
        parsedAi = parsedAi || {};
        parsedAi.expense_date = expDateMatch[1];
        parsedAi.date_found = true;
      } else {
        const dateLineMatch = reasoning.match(/date[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
        if (dateLineMatch) {
          let yr = dateLineMatch[3];
          if (yr.length === 2) yr = '20' + yr;
          parsedAi = parsedAi || {};
          parsedAi.expense_date = yr + '-' + dateLineMatch[2].padStart(2, '0') + '-' + dateLineMatch[1].padStart(2, '0');
          parsedAi.date_found = true;
        }
      }
    }
  }
}

let dateFound = Boolean(parsedAi && parsedAi.date_found && parsedAi.expense_date);
let expenseDate = (parsedAi && parsedAi.expense_date) ? String(parsedAi.expense_date).trim() : null;

if (expenseDate) {
  // Normalize DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY to YYYY-MM-DD
  const dmyMatch = expenseDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    let yr = dmyMatch[3];
    if (yr.length === 2) yr = '20' + yr;
    expenseDate = yr + '-' + dmyMatch[2].padStart(2, '0') + '-' + dmyMatch[1].padStart(2, '0');
    dateFound = true;
  }
}

// Current date in IST (Asia/Kolkata)
const now = new Date();
const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

let branchIndex = 0; // 0 = reupload, 1 = today, 2 = past
let status = 'REUPLOAD_REQUIRED';
let message = 'No date found in the receipt. Please re-upload the image properly with the date clearly visible.';

if (!dateFound || !expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
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
}];"""

openrouter_body = """={\n  \"models\": [\n    \"dots-studio/dots-3-note-preview:free\",\n    \"qwen/qwen3.8-27b:free\",\n    \"google/gemma-4-26b-a4b-it:free\"\n  ],\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": {{ JSON.stringify($json.prompt) }}\n        },\n        {\n          \"type\": \"image_url\",\n          \"image_url\": {\n            \"url\": {{ JSON.stringify($json.imageUrl) }}\n          }\n        }\n      ]\n    }\n  ],\n  \"max_tokens\": 2048,\n  \"temperature\": 0.1\n}"""

import re

def get_openrouter_api_key():
    db_path = os.path.expanduser("~/.n8n/database.sqlite")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("SELECT nodes FROM workflow_entity WHERE id = 'nsQOezpd5Nkptu04'")
        row = c.fetchone()
        if row:
            keys = re.findall(r'sk-or-v1-[a-zA-Z0-9]+', row[0])
            if keys:
                return keys[0]
    return os.environ.get("OPENROUTER_API_KEY", "")

REAL_OR_KEY = get_openrouter_api_key()

# Create a copy for n8n API (with real key) and a copy for git (with placeholder)
nodes_for_n8n = []
nodes_for_git = []

for node in wf["nodes"]:
    node_n8n = json.loads(json.dumps(node))
    node_git = json.loads(json.dumps(node))
    
    if node["name"] == "Prepare Groq Payload":
        node_n8n["parameters"]["jsCode"] = prepare_groq_code
        node_git["parameters"]["jsCode"] = prepare_groq_code
    elif node["name"] == "Call OpenRouter Vision":
        node_n8n["parameters"]["jsonBody"] = openrouter_body
        node_git["parameters"]["jsonBody"] = openrouter_body
        # Ensure n8n gets real key
        for p in node_n8n["parameters"]["headerParameters"]["parameters"]:
            if p["name"] == "Authorization":
                p["value"] = f"Bearer {REAL_OR_KEY}"
        # Ensure git gets placeholder
        for p in node_git["parameters"]["headerParameters"]["parameters"]:
            if p["name"] == "Authorization":
                p["value"] = 'Bearer {{ $env.OPENROUTER_API_KEY || "OPENROUTER_API_KEY_PLACEHOLDER" }}'
    elif node["name"] == "Evaluate Date & Prepare File":
        node_n8n["parameters"]["jsCode"] = evaluate_date_code
        node_git["parameters"]["jsCode"] = evaluate_date_code
        
    nodes_for_n8n.append(node_n8n)
    nodes_for_git.append(node_git)

# Save git version to n8n-workflows/healthaids_doccam_processor.json
canonical_path = os.path.join(os.path.dirname(__file__), "..", "n8n-workflows", "healthaids_doccam_processor.json")
wf_git = dict(wf)
wf_git["nodes"] = nodes_for_git
with open(canonical_path, "w", encoding="utf-8") as f:
    json.dump([wf_git], f, indent=2)
print("Saved clean canonical 16-node workflow (with redacted secret) to:", canonical_path)

# Update n8n live via API
valid_settings_keys = {"executionOrder", "timezone", "callerPolicy", "errorWorkflow", "saveExecutionProgress", "saveManualExecutions", "saveDataErrorExecution", "saveDataSuccessExecution"}
filtered_settings = {k: v for k, v in wf.get("settings", {}).items() if k in valid_settings_keys}

put_data = {
    "name": wf.get("name", "HealthAids DocCam Expense Processor"),
    "nodes": nodes_for_n8n,
    "connections": wf["connections"],
    "settings": filtered_settings
}

put_req = urllib.request.Request(
    BASE_URL,
    headers={
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    },
    data=json.dumps(put_data).encode(),
    method="PUT"
)

try:
    with urllib.request.urlopen(put_req) as put_resp:
        res = json.loads(put_resp.read().decode())
        print(f"SUCCESS! n8n workflow updated with all 16 nodes! Active: {res.get('active')}, Nodes: {len(res.get('nodes', []))}")
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode())
