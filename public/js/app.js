// HealthAids DocCam Application Controller
// Palette: #1eb8c9 (Cyan) & #1a4578 (Deep Navy)
document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentUser = null;
  let activeStream = null;
  let currentFacingMode = 'environment'; // default rear camera
  let capturedBlob = null;
  let deferredInstallPrompt = null;

  // Cached Telemetry
  let deviceDetails = {
    os: 'Unknown OS',
    browser: 'Unknown Browser',
    platform: navigator.platform || 'Unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    dpr: window.devicePixelRatio || 1,
    connection: 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: navigator.language || 'en-US',
    userAgent: navigator.userAgent
  };

  let locationData = {
    latitude: null,
    longitude: null,
    accuracy: null,
    address: 'Location not acquired',
    timestamp: null
  };

  // DOM Elements
  const appHeader = document.getElementById('app-header');
  const authView = document.getElementById('auth-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginFirst = document.getElementById('login-first-name');
  const loginLast = document.getElementById('login-last-name');
  const authAlert = document.getElementById('auth-alert');
  const headerUserName = document.getElementById('header-user-name');
  const headerUserEmail = document.getElementById('header-user-email');
  const headerUserAvatar = document.getElementById('header-user-avatar');
  const btnLogout = document.getElementById('btn-logout');

  // Telemetry DOM
  const locPrimaryText = document.getElementById('loc-primary-text');
  const locSubText = document.getElementById('loc-sub-text');
  const locStatusDot = document.getElementById('loc-status-dot');
  const devPrimaryText = document.getElementById('dev-primary-text');
  const devSubText = document.getElementById('dev-sub-text');

  // Camera & Action DOM
  const btnOpenCamera = document.getElementById('btn-open-camera');
  const autoFilenamePreview = document.getElementById('auto-filename-preview');
  const nativeCameraInput = document.getElementById('native-camera-input');
  const btnFileFallback = document.getElementById('btn-file-fallback');

  // Camera Modal DOM
  const cameraModal = document.getElementById('camera-modal');
  const cameraVideo = document.getElementById('camera-video');
  const captureCanvas = document.getElementById('capture-canvas');
  const btnCloseCamera = document.getElementById('btn-close-camera');
  const btnSwitchCamera = document.getElementById('btn-switch-camera');
  const btnShutter = document.getElementById('btn-shutter');

  // Preview Modal DOM
  const previewModal = document.getElementById('preview-modal');
  const previewImg = document.getElementById('preview-img');
  const previewFilenameText = document.getElementById('preview-filename-text');
  const previewLocText = document.getElementById('preview-loc-text');
  const previewDevText = document.getElementById('preview-dev-text');
  const previewUserText = document.getElementById('preview-user-text');
  const btnRetakePhoto = document.getElementById('btn-retake-photo');
  const btnConfirmUpload = document.getElementById('btn-confirm-upload');
  const uploadProgressBox = document.getElementById('upload-progress-box');
  const uploadProgressBar = document.getElementById('upload-progress-bar');
  const uploadStatusLabel = document.getElementById('upload-status-label');

  // History DOM
  const historyList = document.getElementById('history-list-container');
  const historyCountBadge = document.getElementById('history-count-badge');

  // PWA Shortcut DOM
  const pwaInstallBanner = document.getElementById('pwa-install-banner');
  const btnInstallPwa = document.getElementById('btn-install-pwa');
  const pwaGuideModal = document.getElementById('pwa-guide-modal');
  const btnClosePwaGuide = document.getElementById('btn-close-pwa-guide');
  const iosInstructions = document.getElementById('ios-instructions');
  const androidInstructions = document.getElementById('android-instructions');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // ================= 1. INITIALIZATION & PWA =================
  initPWA();
  detectDevice();
  checkExistingSession();

  function initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.warn('Service Worker notice:', err));
    }

    // Capture PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      pwaInstallBanner.style.display = 'flex';
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      pwaInstallBanner.style.display = 'none';
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        pwaInstallBanner.style.display = 'flex';
      }
    }

    btnInstallPwa.addEventListener('click', handlePwaInstall);
    btnClosePwaGuide.addEventListener('click', () => pwaGuideModal.classList.remove('active'));

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'capture' && currentUser) {
      setTimeout(openCamera, 600);
    }
  }

  function handlePwaInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          showToast('HealthAids shortcut installed to Home Screen!', 'success');
          pwaInstallBanner.style.display = 'none';
        }
        deferredInstallPrompt = null;
      });
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        iosInstructions.style.display = 'block';
        androidInstructions.style.display = 'none';
      } else {
        iosInstructions.style.display = 'none';
        androidInstructions.style.display = 'block';
      }
      pwaGuideModal.classList.add('active');
    }
  }

  // ================= 2. DEVICE & LOCATION TELEMETRY =================
  function detectDevice() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown Browser';
    if (/Chrome|CriOS/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
    else if (/Edge|Edg/i.test(ua)) browser = 'Edge';

    let connectionType = 'Standard Connection';
    if (navigator.connection && navigator.connection.effectiveType) {
      connectionType = navigator.connection.effectiveType.toUpperCase();
    }

    deviceDetails = {
      os,
      browser,
      platform: navigator.platform || os,
      screen: `${window.screen.width}x${window.screen.height}`,
      dpr: window.devicePixelRatio || 1,
      connection: connectionType,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      language: navigator.language || 'en-US',
      userAgent: ua
    };

    devPrimaryText.textContent = `${deviceDetails.os} · ${deviceDetails.browser}`;
    devSubText.textContent = `${deviceDetails.screen} (${deviceDetails.connection})`;
  }

  function acquireLocation() {
    locStatusDot.className = 'telemetry-status-dot acquiring';
    locPrimaryText.textContent = 'Acquiring GPS...';
    locSubText.textContent = 'Connecting to device GPS...';

    if (!navigator.geolocation) {
      locStatusDot.className = 'telemetry-status-dot';
      locPrimaryText.textContent = 'GPS Unavailable';
      locSubText.textContent = 'Geolocation not supported by this browser';
      locationData.address = 'Geolocation not supported';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        locationData.latitude = latitude;
        locationData.longitude = longitude;
        locationData.accuracy = Math.round(accuracy);
        locationData.timestamp = new Date(pos.timestamp).toISOString();

        locStatusDot.className = 'telemetry-status-dot';
        locPrimaryText.textContent = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        locSubText.textContent = `Accuracy: ±${locationData.accuracy}m`;

        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        locStatusDot.className = 'telemetry-status-dot';
        locPrimaryText.textContent = 'GPS Permission Required';
        locSubText.textContent = 'Tap to allow location access';
        locationData.address = 'Location Permission Denied';
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }

  async function reverseGeocode(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.suburb || 'Local Region';
        const state = data.address?.state || '';
        const displayLoc = state ? `${city}, ${state}` : city;
        locationData.address = displayLoc;
        locPrimaryText.textContent = displayLoc;
        locSubText.textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}° (±${locationData.accuracy}m)`;
      }
    } catch (e) {
      locationData.address = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    }
  }

  // ================= 3. GOOGLE & DIRECT AUTHENTICATION =================
  // JWT Parser from Matriderm Sales Bot
  function parseJwt(token) {
    try {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('parseJwt error:', e);
      return null;
    }
  }

  // Global Google Credential Response Handler (Called by Google Identity Services)
  window.handleCredentialResponse = function(response) {
    if (!response || !response.credential) {
      showAuthAlert('Failed to receive Google credential token.', 'error');
      return;
    }

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      showAuthAlert('Invalid Google credential token received.', 'error');
      return;
    }

    console.log("Logged in with Google as:", payload.email);

    // Strict domain check: MUST be @healthaids.in
    if (!payload.email.toLowerCase().endsWith('@healthaids.in')) {
      showAuthAlert(`Access Denied: Google Account (${payload.email}) is not authorized. You must sign in with your @healthaids.in account.`, 'error');
      return;
    }

    let firstName = payload.given_name || '';
    let lastName = payload.family_name || '';
    let fullName = payload.name || `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName) {
      const username = payload.email.split('@')[0];
      const parts = username.split(/[._-]/).filter(Boolean);
      if (!firstName && parts.length > 0) firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      if (!lastName && parts.length > 1) lastName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      if (!firstName) firstName = 'Staff';
      if (!lastName) lastName = 'Member';
    }

    const userSession = {
      id: `usr_${Date.now()}`,
      email: payload.email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: fullName.trim() || `${firstName} ${lastName}`.trim(),
      picture: payload.picture || '',
      authProvider: 'google',
      domain: 'healthaids.in',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('healthaids_user', JSON.stringify(userSession));
    showToast(`Welcome, ${userSession.firstName}!`, 'success');
    setAuthenticatedUser(userSession);
  };

  // Handle Direct HealthAids ID Form Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const firstName = loginFirst.value.trim();
    const lastName = loginLast.value.trim();

    // Client-side strict check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@healthaids\.in$/i;
    if (!emailRegex.test(email)) {
      showAuthAlert('Access Denied: Only @healthaids.in organizational accounts are authorized.', 'error');
      return;
    }

    const btnSubmit = document.getElementById('btn-login-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Verifying...</span>';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('healthaids_user', JSON.stringify(data.user));
        showToast(`Welcome, ${data.user.firstName}!`, 'success');
        setAuthenticatedUser(data.user);
      } else {
        showAuthAlert(data.message || 'Authentication failed. Please verify credentials.', 'error');
      }
    } catch (err) {
      showAuthAlert('Unable to reach authentication server. Check connection.', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span>Continue to DocCam</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
    }
  });

  function checkExistingSession() {
    const saved = localStorage.getItem('healthaids_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.email && user.email.toLowerCase().endsWith('@healthaids.in')) {
          setAuthenticatedUser(user);
          return;
        }
      } catch (e) {
        localStorage.removeItem('healthaids_user');
      }
    }
    showAuthView();
  }

  function showAuthView() {
    currentUser = null;
    appHeader.style.display = 'none';
    dashboardView.style.display = 'none';
    authView.style.display = 'flex';
  }

  function setAuthenticatedUser(user) {
    currentUser = user;
    headerUserName.textContent = user.fullName || `${user.firstName} ${user.lastName}`;
    headerUserEmail.textContent = user.email;

    if (user.picture) {
      headerUserAvatar.src = user.picture;
      headerUserAvatar.style.display = 'block';
    } else {
      headerUserAvatar.style.display = 'none';
    }

    authView.style.display = 'none';
    appHeader.style.display = 'flex';
    dashboardView.style.display = 'flex';

    updateFilenamePreview();
    acquireLocation();
    loadUploadHistory();
  }

  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('healthaids_user');
    showToast('Logged out successfully.');
    showAuthView();
  });

  function showAuthAlert(msg, type = 'error') {
    authAlert.textContent = msg;
    authAlert.className = `auth-alert ${type}`;
    authAlert.style.display = 'flex';
  }

  // ================= 4. AUTOMATIC FILENAME GENERATION =================
  function getTodayDateString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function sanitize(str) {
    if (!str) return 'User';
    return str.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  }

  function getAutoFilename() {
    if (!currentUser) return 'HealthAids_Doc.jpg';
    const first = sanitize(currentUser.firstName);
    const last = sanitize(currentUser.lastName);
    const dateStr = getTodayDateString();
    return `${first}_${last}_${dateStr}.jpg`;
  }

  function updateFilenamePreview() {
    const fn = getAutoFilename();
    autoFilenamePreview.textContent = fn;
  }

  // ================= 5. CAMERA STREAM & CAPTURE =================
  btnOpenCamera.addEventListener('click', openCamera);
  btnFileFallback.addEventListener('click', () => nativeCameraInput.click());
  nativeCameraInput.addEventListener('change', handleNativeFileCapture);

  async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Camera API unavailable. Opening device photo capture.', 'error');
      nativeCameraInput.click();
      return;
    }

    try {
      cameraModal.classList.add('active');
      await startStream(currentFacingMode);
    } catch (err) {
      console.error('Camera stream error:', err);
      closeCameraModal();
      showToast('Camera access denied or unavailable. Opening device file chooser.', 'error');
      nativeCameraInput.click();
    }
  }

  async function startStream(facingMode) {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraVideo.srcObject = activeStream;
    await cameraVideo.play();
  }

  function closeCameraModal() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
    cameraModal.classList.remove('active');
  }

  btnCloseCamera.addEventListener('click', closeCameraModal);

  // Flip between rear & front camera
  btnSwitchCamera.addEventListener('click', async () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    try {
      await startStream(currentFacingMode);
    } catch (e) {
      showToast('Could not switch camera.', 'error');
    }
  });

  // Snap Photo Button Click
  btnShutter.addEventListener('click', () => {
    playShutterFeedback();
    takeSnapshot();
  });

  function playShutterFeedback() {
    if ('vibrate' in navigator) {
      navigator.vibrate([40]);
    }
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {}
  }

  function takeSnapshot() {
    const videoWidth = cameraVideo.videoWidth || 1280;
    const videoHeight = cameraVideo.videoHeight || 720;

    captureCanvas.width = videoWidth;
    captureCanvas.height = videoHeight;
    const ctx = captureCanvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, videoWidth, videoHeight);

    captureCanvas.toBlob((blob) => {
      if (!blob) {
        showToast('Failed to capture snapshot.', 'error');
        return;
      }
      capturedBlob = blob;
      closeCameraModal();
      showPreviewModal(blob);
    }, 'image/jpeg', 0.92);
  }

  function handleNativeFileCapture(e) {
    const file = e.target.files[0];
    if (file) {
      capturedBlob = file;
      showPreviewModal(file);
    }
    nativeCameraInput.value = '';
  }

  // ================= 6. SNAPSHOT REVIEW & UPLOAD =================
  function showPreviewModal(blob) {
    const url = URL.createObjectURL(blob);
    previewImg.src = url;

    const filename = getAutoFilename();
    previewFilenameText.textContent = filename;

    previewLocText.textContent = locationData.latitude 
      ? `${locationData.address} (±${locationData.accuracy || 10}m)`
      : 'Tagging live GPS coordinates...';

    previewDevText.textContent = `${deviceDetails.os} · ${deviceDetails.browser} (${deviceDetails.screen})`;
    previewUserText.textContent = `${currentUser.fullName} (${currentUser.email})`;

    uploadProgressBox.style.display = 'none';
    uploadProgressBar.style.width = '0%';
    btnConfirmUpload.disabled = false;
    btnConfirmUpload.innerHTML = `
      <span>Upload Document</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      </svg>
    `;

    previewModal.classList.add('active');
  }

  btnRetakePhoto.addEventListener('click', () => {
    previewModal.classList.remove('active');
    capturedBlob = null;
    openCamera();
  });

  btnConfirmUpload.addEventListener('click', performUpload);

  async function performUpload() {
    if (!capturedBlob || !currentUser) {
      showToast('No photo ready for upload.', 'error');
      return;
    }

    const filename = getAutoFilename();
    const formData = new FormData();

    // CRITICAL: Append metadata fields FIRST so any streaming multipart parser gets user details before processing file!
    formData.append('email', currentUser.email);
    formData.append('firstName', currentUser.firstName);
    formData.append('lastName', currentUser.lastName);

    if (locationData.latitude) {
      formData.append('latitude', locationData.latitude);
      formData.append('longitude', locationData.longitude);
      formData.append('accuracy', locationData.accuracy);
      formData.append('locationAddress', locationData.address);
      formData.append('locationTimestamp', locationData.timestamp || new Date().toISOString());
    }

    formData.append('deviceInfo', JSON.stringify(deviceDetails));
    
    // Append binary file with calculated filename
    formData.append('documentPhoto', capturedBlob, filename);

    // Progress animation UI
    uploadProgressBox.style.display = 'block';
    uploadProgressBar.style.width = '35%';
    uploadStatusLabel.textContent = `Uploading ${filename}...`;
    btnConfirmUpload.disabled = true;

    try {
      setTimeout(() => { uploadProgressBar.style.width = '75%'; }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        uploadProgressBar.style.width = '100%';
        uploadStatusLabel.textContent = 'Upload Complete!';
        
        setTimeout(() => {
          previewModal.classList.remove('active');
          showToast(`Document uploaded: ${data.record.filename}`, 'success');
          loadUploadHistory();
        }, 400);
      } else {
        uploadProgressBox.style.display = 'none';
        btnConfirmUpload.disabled = false;
        showToast(data.message || 'Upload failed.', 'error');
      }
    } catch (err) {
      uploadProgressBox.style.display = 'none';
      btnConfirmUpload.disabled = false;
      showToast('Network error during upload. Please retry.', 'error');
    }
  }

  // ================= 7. UPLOAD HISTORY & AUDIT LOG =================
  async function loadUploadHistory() {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/records?email=${encodeURIComponent(currentUser.email)}`);
      if (response.ok) {
        const data = await response.json();
        renderHistory(data.records || []);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  }

  function renderHistory(records) {
    historyCountBadge.textContent = `${records.length} files`;

    if (records.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          No documents uploaded yet today. Click the camera button to snap your first document.
        </div>
      `;
      return;
    }

    historyList.innerHTML = records.map(rec => {
      const timeStr = new Date(rec.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sizeKb = Math.round((rec.size || 0) / 1024);
      const locDisplay = rec.location?.address || 'GPS Tagged';

      return `
        <div class="history-item">
          <div class="history-item-left">
            <img src="${rec.fileUrl}" class="history-thumb" alt="thumb" loading="lazy" />
            <div class="history-file-info">
              <div class="history-filename" title="${rec.filename}">${rec.filename}</div>
              <div class="history-meta">
                <span>🕒 ${timeStr} · ${sizeKb} KB</span>
                <span class="history-meta-loc">📍 ${escapeHtml(locDisplay)}</span>
              </div>
            </div>
          </div>
          <div class="history-actions">
            <a href="${rec.fileUrl}" target="_blank" class="history-btn" title="View Full Document">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </a>
            <a href="${rec.fileUrl}" download="${rec.filename}" class="history-btn" title="Download Document">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="15"></line>
              </svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ================= 8. TOAST NOTIFICATIONS =================
  function showToast(msg, type = 'normal') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
