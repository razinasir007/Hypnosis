const { validationResult } = require("express-validator");
const {
  SUCCESS_STATUS_CODE,
  CREATE_STATUS_CODE,
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
} = require("../config/config");
const { User } = require("../models/User");
const { logger } = require("../logger");
const { isWithinAWeek } = require("../utils/helpers");
const { Favorites } = require("../models/Favorites");
const { Playlist } = require("../models/Playlist");
const { PlaylistAudio } = require("../models/PlaylistAudio");

async function getDailyCheckIns(req, res, next) {
  try {
    const dailyCheckIns = await User.aggregate([
      {
        $match: {
          lastCheckInDate: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastCheckInDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //console.log("Daily check-ins:", dailyCheckIns);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      dailyCheckIns,
    });
  } catch (error) {
    console.error("Error fetching check-in data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getDailyCheckInsMonthly(req, res, next) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const dailyCheckIns = await User.aggregate([
      {
        $match: {
          $and: [
            { lastCheckInDate: { $exists: true } },
            {
              createdAt: {
                $gte: new Date(currentYear, currentMonth - 1, 1),
                $lt: new Date(currentYear, currentMonth, 1),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastCheckInDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const totalUsers = await User.countDocuments();

    const usersRegisteredMonthlyWithPercentage = dailyCheckIns.map(
      (dailyData) => ({
        date: dailyData._id,
        count: dailyData.count,
      })
    );

    const percentageIncrease = (
      (usersRegisteredMonthlyWithPercentage[
        usersRegisteredMonthlyWithPercentage.length - 1
      ].count /
        totalUsers) *
      100
    ).toFixed(2);

    //console.log("Daily check-ins:", dailyCheckIns);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      dailyCheckIns:usersRegisteredMonthlyWithPercentage,
      percentageIncrease,
    });
  } catch (error) {
    console.error("Error fetching check-in data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUserWithLongestStreak(req, res, next) {
  try {
    const usersWithLongestStreaks = await User.find()
      .sort("-consecutiveStreak")
      .limit(1);
    //console.log("Users with longest streaks:", usersWithLongestStreaks);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      usersWithLongestStreaks,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}
async function getFavoriteCountsPerUser(req, res, next) {
  try {
    const favoriteCountsPerUser = await Favorites.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$user.name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    //console.log("Favorite counts per user:", favoriteCountsPerUser);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      favoriteCountsPerUser,
    });
  } catch (error) {
    console.error("Error fetching favorite data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getPlaylistCountsPerUser(req, res, next) {
  try {
    const playlistCountsPerUser = await Playlist.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$user.name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    //console.log("Playlist counts per user:", playlistCountsPerUser);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      playlistCountsPerUser,
    });
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getAudioCountsPerPlaylist(req, res, next) {
  try {
    const audioCountsPerPlaylist = await PlaylistAudio.aggregate([
      {
        $lookup: {
          from: "playlists",
          localField: "playlistId",
          foreignField: "_id",
          as: "playlist",
        },
      },
      {
        $unwind: "$playlist",
      },
      {
        $lookup: {
          from: "users",
          localField: "playlist.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: "$playlistId",
          playlistName: { $first: "$playlist.name" },
          userName: { $first: "$user.name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    //console.log("Audio counts per playlist:", audioCountsPerPlaylist);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      audioCountsPerPlaylist,
    });
  } catch (error) {
    console.error("Error fetching playlist audio data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getActiveUsers(req, res, next) {
  try {
    //   const oneWeekAgo = new Date();
    //   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    //   const activeUsers = await User.countDocuments({
    //     lastCheckInDate: {
    //       $gte: oneWeekAgo
    //     }
    //   });

    //   //console.log("Active users:", activeUsers);
    //   return res.status(SUCCESS_STATUS_CODE).json({
    //     success: true,
    //     activeUsers,
    //   });
    const users = await User.find({});

    // //console.log(users)
    // Calculate active users based on lastcheckin and consecutiveStreak
    const activeUsers = users.filter((user) => {
      // Replace 'lastcheckin' and 'consecutiveStreak' with the actual field names in your collection
      const check = isWithinAWeek(user.lastCheckInDate);
      return (
        user.lastCheckInDate !== null && user.consecutiveStreak > 0 && check
      );
    });

    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      totalUsers: users.length,
      activeUsers: activeUsers.length,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getPlaylistsCreatedDaily(req, res, next) {
  try {
    const playlistsCreatedDaily = await Playlist.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //console.log("Playlists created daily:", playlistsCreatedDaily);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      playlistsCreatedDaily,
    });
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUsersCreatedDaily(req, res, next) {
  try {
    const usersCreatedDaily = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //console.log("Users created daily:", usersCreatedDaily);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      usersCreatedDaily,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUserWithMostFavorites(req, res, next) {
  try {
    const userWithMostFavorites = await User.aggregate([
      {
        $lookup: {
          from: "favorites",
          localField: "_id",
          foreignField: "userId",
          as: "favorites",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$name",
          numberOfFavorites: { $size: "$favorites" },
        },
      },
      {
        $sort: {
          numberOfFavorites: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    //console.log("User with most favorites:", userWithMostFavorites);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      userWithMostFavorites,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUserWithMostPlaylists(req, res, next) {
  try {
    const userWithMostPlaylists = await Playlist.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          username: "$user.name",
          numberOfPlaylists: "$count",
        },
      },
    ]);

    //console.log("User with most playlists:", userWithMostPlaylists);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      userWithMostPlaylists,
    });
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUsersWithLongestStreaks(req, res, next) {
  try {
    const usersWithLongestStreaks = await User.aggregate([
      {
        $project: {
          _id: "$_id",
          name: "$name",
          streak: "$consecutiveStreak",
        },
      },

      {
        $sort: {
          streak: -1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    //console.log("Users with longest streaks:", usersWithLongestStreaks);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      usersWithLongestStreaks,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getUsersRegisteredMonthly(req, res, next) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const usersRegisteredMonthly = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const totalUsers = await User.countDocuments();

    const usersRegisteredMonthlyWithPercentage = usersRegisteredMonthly.map(
      (dailyData) => ({
        date: dailyData._id,
        count: dailyData.count,
      })
    );

    const percentageIncrease = (
      (usersRegisteredMonthlyWithPercentage[
        usersRegisteredMonthlyWithPercentage.length - 1
      ].count /
        totalUsers) *
      100
    ).toFixed(2);

    //console.log(
    //   "Users registered daily in the current month with percentage increase:",
    //   usersRegisteredMonthlyWithPercentage
    // );
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      usersRegisteredMonthlyWithPercentage,
      percentageIncrease,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getPlaylistsCreatedMonthly(req, res, next) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const playlistsCreatedMonthly = await Playlist.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //console.log(playlistsCreatedMonthly);
    const totalPlaylists = await Playlist.countDocuments();
    if (playlistsCreatedMonthly.length > 0) {
      const playlistsCreatedMonthlyWithPercentage = playlistsCreatedMonthly.map(
        (dailyData) => ({
          date: dailyData._id,
          count: dailyData.count,
        })
      );

      const percentageIncrease = (
        (playlistsCreatedMonthlyWithPercentage[
          playlistsCreatedMonthlyWithPercentage.length - 1
        ].count /
          totalPlaylists) *
        100
      ).toFixed(2);

      //console.log(
      //     "Playlists created daily in the current month with percentage increase:",
      //     playlistsCreatedMonthlyWithPercentage
      //   );
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        playlistsCreatedMonthlyWithPercentage,
        percentageIncrease,
        totalPlaylists,
      });
    } else {
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        playlistsCreatedMonthlyWithPercentage: [],
        percentageIncrease: 0,
        totalPlaylists,
      });
    }
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return next({ message: "Internal Server Error" });
  }
}

async function getFavoritesCreatedMonthly(req, res, next) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const favoritesCreatedMonthly = await Favorites.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //console.log(playlistsCreatedMonthly);
    const totalFavorites = await Favorites.countDocuments();
    if (favoritesCreatedMonthly.length > 0) {
      const favoritesCreatedMonthlyWithPercentage = favoritesCreatedMonthly.map(
        (dailyData) => ({
          date: dailyData._id,
          count: dailyData.count,
        })
      );

      const percentageIncrease = (
        (favoritesCreatedMonthlyWithPercentage[
          favoritesCreatedMonthlyWithPercentage.length - 1
        ].count /
          totalFavorites) *
        100
      ).toFixed(2);

      //console.log(
      //     "Playlists created daily in the current month with percentage increase:",
      //     playlistsCreatedMonthlyWithPercentage
      //   );
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        favoritesCreatedMonthlyWithPercentage,
        percentageIncrease,
        totalFavorites,
      });
    } else {
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        favoritesCreatedMonthlyWithPercentage: [],
        percentageIncrease: 0,
        totalFavorites,
      });
    }
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    return next({ message: "Internal Server Error" });
  }
}

module.exports = {
  getDailyCheckIns,
  getFavoriteCountsPerUser,
  getPlaylistCountsPerUser,
  getUsersWithLongestStreaks,
  getAudioCountsPerPlaylist,
  getActiveUsers,
  getPlaylistsCreatedDaily,
  getUsersCreatedDaily,
  getUserWithMostFavorites,
  getUserWithMostPlaylists,
  getUsersRegisteredMonthly,
  getPlaylistsCreatedMonthly,
  getUserWithLongestStreak,
  getDailyCheckInsMonthly,
  getFavoritesCreatedMonthly,
};
