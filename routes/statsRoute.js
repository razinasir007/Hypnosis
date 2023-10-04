const express = require("express");
const {
  getDailyCheckIns,
  getUsersWithLongestStreaks,
  getFavoriteCountsPerUser,
  getPlaylistCountsPerUser,
  getAudioCountsPerPlaylist,
  getActiveUsers,
  getPlaylistsCreatedDaily,
  getUsersCreatedDaily,
  getUserWithMostFavorites,
  getUserWithMostPlaylists,
  getUsersRegisteredMonthly,
  getUserWithLongestStreak,
  getPlaylistsCreatedMonthly,
  getDailyCheckInsMonthly,
  getFavoritesCreatedMonthly,
} = require("../controllers/statsController");
const router = express.Router();

router.get("/stats/daily-checkins", getDailyCheckIns);
router.get("/stats/longest-streaks", getUserWithLongestStreak);
router.get("/stats/favorite-counts", getFavoriteCountsPerUser);
router.get("/stats/playlist-counts", getPlaylistCountsPerUser);
router.get("/stats/audio-counts-per-playlist", getAudioCountsPerPlaylist);
router.get("/stats/active-users", getActiveUsers);
router.get("/stats/playlists-created-daily", getPlaylistsCreatedDaily);
router.get("/stats/users-created-daily", getUsersCreatedDaily);
router.get("/stats/user-with-most-favorites", getUserWithMostFavorites);
router.get("/stats/user-with-most-playlists", getUserWithMostPlaylists);
router.get("/stats/users-with-longest-streaks", getUsersWithLongestStreaks);
router.get("/stats/users-registered-monthly", getUsersRegisteredMonthly);
router.get("/stats/playlists-created-monthly", getPlaylistsCreatedMonthly);
router.get("/stats/daily-checkins-monthly", getDailyCheckInsMonthly);
router.get("/stats/favorites-created-monthly", getFavoritesCreatedMonthly);


module.exports = router;
