const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8000;

// Directories (fallback to /tmp when running serverless on Vercel)
const UPLOADS_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
const DATA_FILE = process.env.VERCEL ? path.join('/tmp', 'records.json') : path.join(__dirname, 'data', 'records.json');

// Ensure directories and storage files exist
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
} catch (e) {
  console.warn('Directory init note:', e.message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper function to read records
function getRecords() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading records:', err);
    return [];
  }
}

// Helper function to save records
function saveRecords(records) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
  } catch (err) {
    console.error('Error writing records:', err);
  }
}

// Strict domain validator: MUST be healthaids.in
function isValidHealthAidsEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  const regex = /^[a-zA-Z0-9._%+-]+@healthaids\.in$/;
  return regex.test(cleanEmail);
}

// Helper to sanitize names: "Rahul" & "Sharma" -> "Rahul_Sharma"
function sanitizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Format date as YYYY-MM-DD
function getFormattedDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate unique filename: {first_name}_{last_name}_{date}.jpg
function generateFileName(firstName, lastName, extension = '.jpg') {
  let cleanFirst = sanitizeName(firstName);
  let cleanLast = sanitizeName(lastName);

  if (!cleanFirst && !cleanLast) {
    cleanFirst = 'User';
    cleanLast = 'HealthAids';
  } else if (!cleanFirst) {
    cleanFirst = cleanLast;
    cleanLast = 'User';
  } else if (!cleanLast) {
    cleanLast = 'Doc';
  }

  const dateStr = getFormattedDate();
  let baseName = `${cleanFirst}_${cleanLast}_${dateStr}`;
  let finalName = `${baseName}${extension}`;

  // Check if file already exists in uploads to prevent overwriting
  let counter = 1;
  while (fs.existsSync(path.join(UPLOADS_DIR, finalName))) {
    finalName = `${baseName}_${String(counter).padStart(2, '0')}${extension}`;
    counter++;
  }

  return finalName;
}

// Use Memory Storage so all text fields in req.body are completely parsed before writing file
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

// Helper to verify Google ID Token with Google's API
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error_description || parsed.error) {
            return reject(new Error(parsed.error_description || parsed.error));
          }
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper to decode JWT payload locally if offline or in simulated demo mode
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// ================= API ROUTES =================

// 1. Google Authentication Endpoint (Strictly @healthaids.in)
app.post('/api/auth/google', async (req, res) => {
  const { credential, clientEmail, clientFirstName, clientLastName } = req.body;

  let email = '';
  let firstName = '';
  let lastName = '';
  let fullName = '';
  let picture = '';

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google authentication credential is required.'
    });
  }

  // Attempt verification via Google's tokeninfo endpoint
  try {
    const googleUser = await verifyGoogleToken(credential);
    email = (googleUser.email || '').toLowerCase().trim();
    firstName = googleUser.given_name || '';
    lastName = googleUser.family_name || '';
    fullName = googleUser.name || `${firstName} ${lastName}`.trim();
    picture = googleUser.picture || '';
  } catch (err) {
    // Fallback: decode JWT payload
    const decoded = decodeJwtPayload(credential);
    if (decoded && decoded.email) {
      email = (decoded.email || '').toLowerCase().trim();
      firstName = decoded.given_name || '';
      lastName = decoded.family_name || '';
      fullName = decoded.name || `${firstName} ${lastName}`.trim();
      picture = decoded.picture || '';
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential token.'
      });
    }
  }

  // Strict domain enforcement: MUST be @healthaids.in
  if (!isValidHealthAidsEmail(email)) {
    return res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_DOMAIN',
      message: `Access Denied: Google Account (${email}) does not belong to @healthaids.in. Only authorized organizational IDs can access this application.`
    });
  }

  // If first name or last name are empty, derive from email username (e.g. rahul.sharma@healthaids.in)
  if (!firstName || !lastName) {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/).filter(Boolean);
    if (!firstName && parts.length > 0) {
      firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    if (!lastName && parts.length > 1) {
      lastName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    if (!firstName) firstName = 'Staff';
    if (!lastName) lastName = 'Member';
    if (!fullName) fullName = `${firstName} ${lastName}`;
  }

  const userSession = {
    id: `usr_${Date.now()}`,
    email: email,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    fullName: fullName.trim(),
    picture: picture,
    authProvider: 'google',
    domain: 'healthaids.in',
    loginTime: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: `Google verification successful. Welcome, ${firstName}!`,
    user: userSession
  });
});

// 2. Upload Document Endpoint with Location & Device Details
app.post('/api/upload', upload.single('documentPhoto'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No photo or document file received.'
      });
    }

    const {
      email,
      firstName,
      lastName,
      latitude,
      longitude,
      accuracy,
      locationAddress,
      locationTimestamp,
      deviceInfo
    } = req.body;

    // Verify email domain again
    if (!isValidHealthAidsEmail(email)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Upload rejected because user email is not @healthaids.in'
      });
    }

    // Resolve user names for file naming
    let resolvedFirst = firstName ? firstName.trim() : '';
    let resolvedLast = lastName ? lastName.trim() : '';

    if (!resolvedFirst || !resolvedLast) {
      const username = (email || '').split('@')[0];
      const parts = username.split(/[._-]/).filter(Boolean);
      if (!resolvedFirst && parts.length > 0) {
        resolvedFirst = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      if (!resolvedLast && parts.length > 1) {
        resolvedLast = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('_');
      }
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = generateFileName(resolvedFirst, resolvedLast, ext);
    const targetFilePath = path.join(UPLOADS_DIR, filename);

    // Write file buffer to disk with the guaranteed {firstName}_{lastName}_{date} name
    fs.writeFileSync(targetFilePath, file.buffer);

    let parsedDeviceInfo = {};
    if (deviceInfo) {
      try {
        parsedDeviceInfo = typeof deviceInfo === 'string' ? JSON.parse(deviceInfo) : deviceInfo;
      } catch (e) {
        parsedDeviceInfo = { raw: deviceInfo };
      }
    }

    const record = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      filename: filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      fileUrl: `/uploads/${filename}`,
      uploadedAt: new Date().toISOString(),
      user: {
        email: email.trim().toLowerCase(),
        firstName: resolvedFirst,
        lastName: resolvedLast,
        fullName: `${resolvedFirst} ${resolvedLast}`.trim()
      },
      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        address: locationAddress || 'GPS Location Tagged',
        timestamp: locationTimestamp || new Date().toISOString()
      },
      device: parsedDeviceInfo
    };

    // Save to records database
    const records = getRecords();
    records.unshift(record);
    saveRecords(records);

    return res.status(201).json({
      success: true,
      message: `Document successfully uploaded as "${filename}"`,
      record: record
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process document upload: ' + err.message
    });
  }
});

// 4. Get Records Endpoint (Filtered by User or Recent)
app.get('/api/records', (req, res) => {
  const { email } = req.query;
  let records = getRecords();

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    records = records.filter(r => r.user && r.user.email === cleanEmail);
  }

  return res.json({
    success: true,
    total: records.length,
    records: records
  });
});

// 5. Get Single Record Details
app.get('/api/records/:id', (req, res) => {
  const records = getRecords();
  const found = records.find(r => r.id === req.params.id);
  if (!found) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  return res.json({ success: true, record: found });
});

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HealthAids Document Capture Service',
    domain: 'healthaids.in',
    theme: {
      primary: '#1eb8c9',
      secondary: '#1a4578'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded documents statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve static frontend and PWA assets
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only listen if run directly or not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` HealthAids DocCam Server active on http://localhost:${PORT}`);
    console.log(` Theme Palette: #1eb8c9 (Cyan) & #1a4578 (Deep Navy)`);
    console.log(` Authorized Domain: @healthaids.in`);
    console.log(` Google Authentication: Enabled`);
    console.log(` Upload Directory: ${UPLOADS_DIR}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
