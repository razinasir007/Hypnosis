const cron = require("node-cron");
const { FREE_PODCAST_URL, PREMIUM_PODCAST_URL } = require("../config/config");
const { checkPodcast } = require("../utils/podcastCronCheck");
const { logger } = require("../logger");

// Schedule the task to run once a day at 3:00 AM
cron.schedule("0 15 * * *", () => {
  checkPodcast(FREE_PODCAST_URL, false);
  logger.debug("Free podcast executed at 8:00 AM");
});
// Schedule the task to run at 3:10 AM every day
cron.schedule("10 15 * * *", () => {
  // Your task logic goes here
  checkPodcast(PREMIUM_PODCAST_URL, true);

  logger.debug("Premium podcast executed at 8:10 AM");
});
