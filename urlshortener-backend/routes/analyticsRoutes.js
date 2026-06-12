const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ShortUrl = require("../models/ShortUrl");
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/analytics/dashboard/summary
router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Fetch all user's URLs
    const urls = await ShortUrl.find({ user: userId });
    const totalUrls = urls.length;

    let totalClicks = 0;
    let activeUrls = 0;

    const now = new Date();
    urls.forEach((url) => {
      totalClicks += url.clicks || 0;
      const isExpired = url.expiryDate && new Date(url.expiryDate) < now;
      if (url.isActive && !isExpired) {
        activeUrls += 1;
      }
    });

    // Fetch top 5 URLs by clicks
    const topUrls = await ShortUrl.find({ user: userId })
      .sort({ clicks: -1 })
      .limit(5);

    res.json({
      totalUrls,
      totalClicks,
      activeUrls,
      topUrls,
    });
  } catch (error) {
    console.error("Error in GET /api/analytics/dashboard/summary:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET /api/analytics/:urlId
router.get("/:urlId", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const urlId = new mongoose.Types.ObjectId(req.params.urlId);

    // Verify URL ownership
    const url = await ShortUrl.findOne({ _id: urlId, user: userId });
    if (!url) {
      return res.status(404).json({
        message: "URL not found or unauthorized.",
      });
    }

    // 1. Device distribution aggregation
    const deviceBreakdown = await Visit.aggregate([
      { $match: { shortUrl: urlId } },
      { $group: { _id: "$device", value: { $sum: 1 } } },
    ]);

    // 2. Browser distribution aggregation
    const browserBreakdown = await Visit.aggregate([
      { $match: { shortUrl: urlId } },
      { $group: { _id: "$browser", value: { $sum: 1 } } },
    ]);

    // 3. Daily trends for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyVisits = await Visit.aggregate([
      {
        $match: {
          shortUrl: urlId,
          visitedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate full list of the last 7 days (including days with 0 clicks)
    const clickTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const foundDay = dailyVisits.find((v) => v._id === dateString);
      clickTrends.push({
        date: dateString,
        clicks: foundDay ? foundDay.clicks : 0,
      });
    }

    // 4. Recent visits log (last 10 visits)
    const recentVisits = await Visit.find({ shortUrl: urlId })
      .sort({ visitedAt: -1 })
      .limit(10);

    res.json({
      url,
      analytics: {
        deviceBreakdown: deviceBreakdown.map(item => ({ name: item._id, value: item.value })),
        browserBreakdown: browserBreakdown.map(item => ({ name: item._id, value: item.value })),
        clickTrends,
        recentVisits,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
