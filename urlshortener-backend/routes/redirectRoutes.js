const express = require("express");
const router = express.Router();

const ShortUrl = require("../models/ShortUrl");
const Visit = require("../models/Visit");

router.get("/:shortCode", async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
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
              <a href="${frontendUrl}">Go to Katomaran</a>
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
              <a href="${frontendUrl}">Go to Katomaran</a>
            </div>
          </body>
        </html>
      `);
    }

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

    res.redirect(url.originalUrl);
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