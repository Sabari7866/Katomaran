const express = require("express");
const router = express.Router();

const ShortUrl = require("../models/ShortUrl");
const Visit = require("../models/Visit");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

function getPasswordPage(shortCode, errorMsg = "") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Protected Link - SnapLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0b0f19 0%, #111827 50%, #070a13 100%);
      --accent-cyan: #06b6d4;
      --accent-purple: #a855f7;
      --accent-blue: #3b82f6;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --card-bg: rgba(17, 24, 39, 0.75);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      position: relative;
    }
    
    body::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -20%;
      width: 60%;
      height: 60%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
      z-index: 0;
      filter: blur(80px);
      pointer-events: none;
    }
    
    body::after {
      content: '';
      position: absolute;
      bottom: -20%;
      right: -20%;
      width: 60%;
      height: 60%;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
      z-index: 0;
      filter: blur(80px);
      pointer-events: none;
    }
    
    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 40px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    
    .lock-icon-container {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px auto;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      position: relative;
      animation: pulse 2s infinite ease-in-out;
    }
    
    .lock-icon-container svg {
      width: 32px;
      height: 32px;
      fill: none;
      stroke: url(#lockGradient);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(to right, #ffffff, #d1d5db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p.subtitle {
      color: var(--text-muted);
      font-size: 15px;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    
    .form-group {
      margin-bottom: 24px;
      text-align: left;
      position: relative;
    }
    
    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .input-field {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: var(--text-main);
      font-size: 16px;
      font-family: inherit;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    
    .input-field:focus {
      border-color: var(--accent-cyan);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
    }
    
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 24px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: shake 0.4s ease;
    }
    
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    }
    
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(168, 85, 247, 0.35);
      filter: brightness(1.1);
    }
    
    .submit-btn:active {
      transform: translateY(0);
    }
    
    .footer-brand {
      margin-top: 32px;
      font-size: 13px;
      color: var(--text-muted);
    }
    
    .footer-brand span {
      background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); }
      50% { transform: scale(1.03); box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3); border-color: rgba(6, 182, 212, 0.3); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="lock-icon-container">
        <svg viewBox="0 0 24 24">
          <defs>
            <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#06b6d4" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
          </defs>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      
      <h1>Link is Protected</h1>
      <p class="subtitle">This URL is password secured. Please enter the password to proceed.</p>
      
      <form action="/${shortCode}" method="POST">
        ${errorMsg ? `
        <div class="error-message">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>${errorMsg}</span>
        </div>
        ` : ''}
        
        <div class="form-group">
          <label for="password">Enter Password</label>
          <input type="password" id="password" name="password" class="input-field" placeholder="••••••••" required autofocus>
        </div>
        
        <button type="submit" class="submit-btn">Unlock & Redirect</button>
      </form>
      
      <div class="footer-brand">
        Secured by <span>SnapLink</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function recordVisitAndRedirect(req, res, url) {
  // Update URL click statistics
  url.clicks += 1;
  url.lastVisited = new Date();
  await url.save();

  // Parse User Agent details
  const userAgent = req.headers["user-agent"] || "";
  const refererHeader = req.headers["referer"] || "";

  // Device detection
  let device = "Desktop";
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
    device = "Mobile";
  }

  // Browser detection
  let browser = "Other";
  if (/edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/chrome|crios/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
    browser = "Safari";
  }

  // Parse Referer website or Direct
  let referer = "Direct";
  if (refererHeader) {
    try {
      const urlObj = new URL(refererHeader);
      referer = urlObj.hostname;
    } catch (e) {
      referer = refererHeader;
    }
  }

  // Log the visit details
  await Visit.create({
    shortUrl: url._id,
    ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
    userAgent: userAgent.substring(0, 500),
    device,
    browser,
    referer,
  });

  return res.redirect(url.originalUrl);
}

router.get("/:shortCode", async (req, res) => {
  try {
    // Find URL by shortCode or customAlias
    const url = await ShortUrl.findOne({
      $or: [{ shortCode: req.params.shortCode }, { customAlias: req.params.shortCode }],
    });

    if (!url || !url.isActive) {
      return res.status(404).send(`
        <html>
          <head>
            <title>URL Not Found</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 100px 20px; background: #0f172a; color: #f1f5f9; }
              .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }
              h1 { color: #f43f5e; margin-top: 0; }
              p { color: #94a3b8; font-size: 16px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
              a:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found 🔍</h1>
              <p>Sorry, the link you are trying to access does not exist or has been deleted.</p>
              <a href="${frontendUrl}">Go to SnapLink</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check for expiration
    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      url.isActive = false;
      await url.save();
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 100px 20px; background: #0f172a; color: #f1f5f9; }
              .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }
              h1 { color: #f59e0b; margin-top: 0; }
              p { color: #94a3b8; font-size: 16px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
              a:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Expired ⏰</h1>
              <p>Sorry, this shortened URL has reached its expiration date and is no longer active.</p>
              <a href="${frontendUrl}">Go to SnapLink</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check for password protection
    if (url.password) {
      return res.send(getPasswordPage(req.params.shortCode));
    }

    return await recordVisitAndRedirect(req, res, url);
  } catch (error) {
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body style="background: #0f172a; color: white; padding: 50px; font-family: sans-serif; text-align: center;">
          <h1>Server Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

router.post("/:shortCode", async (req, res) => {
  try {
    const { password } = req.body;
    const shortCode = req.params.shortCode;

    // Find URL by shortCode or customAlias
    const url = await ShortUrl.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url || !url.isActive) {
      return res.status(404).send(`
        <html>
          <head>
            <title>URL Not Found</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 100px 20px; background: #0f172a; color: #f1f5f9; }
              .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }
              h1 { color: #f43f5e; margin-top: 0; }
              p { color: #94a3b8; font-size: 16px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
              a:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found 🔍</h1>
              <p>Sorry, the link you are trying to access does not exist or has been deleted.</p>
              <a href="${frontendUrl}">Go to SnapLink</a>
            </div>
          </body>
        </html>
      `);
    }

    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      url.isActive = false;
      await url.save();
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 100px 20px; background: #0f172a; color: #f1f5f9; }
              .card { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }
              h1 { color: #f59e0b; margin-top: 0; }
              p { color: #94a3b8; font-size: 16px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
              a:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Expired ⏰</h1>
              <p>Sorry, this shortened URL has reached its expiration date and is no longer active.</p>
              <a href="${frontendUrl}">Go to SnapLink</a>
            </div>
          </body>
        </html>
      `);
    }

    if (!url.password) {
      return await recordVisitAndRedirect(req, res, url);
    }

    const isMatch = await url.comparePassword(password);
    if (!isMatch) {
      return res.send(getPasswordPage(shortCode, "Incorrect password. Please try again."));
    }

    return await recordVisitAndRedirect(req, res, url);
  } catch (error) {
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body style="background: #0f172a; color: white; padding: 50px; font-family: sans-serif; text-align: center;">
          <h1>Server Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

module.exports = router;