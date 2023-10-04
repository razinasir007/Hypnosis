const express = require("express");
const { checkPodcast } = require("../utils/podcastCronCheck");
const { FREE_PODCAST_URL, PREMIUM_PODCAST_URL } = require("../config/config");
const router = express.Router();

router.get("/cron", async (req, res, next) => {
  try {
    await checkPodcast(FREE_PODCAST_URL, false);
    await checkPodcast(PREMIUM_PODCAST_URL, true);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next({
      status: NOT_FOUND_STATUS_CODE,
      message: "Not Synced",
    });
  }
});

module.exports = router;
