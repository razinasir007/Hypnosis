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
const { Subscription } = require("../models/Subscriptions");

const login = async (req, res, next) => {
  //logger.debug("%O", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const email = req.body.email;

    const user = await User.findOne({ email });
    //logger.debug("%O", user);
    if (user) {
      return res.status(SUCCESS_STATUS_CODE).json({ success: true, user });
    } else {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        emailOptIn: req.body.emailOptIn,
      });
      const subs = await Subscription.create({
        userId: newUser._id,
        subscriptionType: "none",
      });
      //logger.debug("%O", newUser);
      return res
        .status(CREATE_STATUS_CODE)
        .json({ success: true, user: newUser, subs });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getCheckIn = async (req, res, next) => {
  //logger.debug("%O", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    //logger.debug("%O", user);
    if (user) {
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        lastCheckInDate: user.lastCheckInDate || null,
        streak: user.consecutiveStreak,
      });
    } else {
      return next({ status: NOT_FOUND_STATUS_CODE, message: "User not found" });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const updateCheckIn = async (req, res, next) => {
  //logger.debug("%O", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { email, lastCheckInDate, streak } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { lastCheckInDate, consecutiveStreak: streak },
      { new: true }
    );
    //logger.debug("%O", user);
    if (user) {
      return res.status(SUCCESS_STATUS_CODE).json({ success: true, user });
    } else {
      return next({ status: NOT_FOUND_STATUS_CODE, message: "User not found" });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "favorites",
          localField: "_id",
          foreignField: "userId",
          as: "favorites",
        },
      },
      {
        $lookup: {
          from: "playlists",
          localField: "_id",
          foreignField: "userId",
          as: "playlists",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "userId",
          as: "subscription",
        },
      },
      {
        $unwind:{
          path: "$subscription",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          favoriteCount: { $size: "$favorites" },
          playlistCount: { $size: "$playlists" },
          subscriptionType: "$subscription.subscriptionType",
          subscriptionStartDate: "$subscription.subscriptionStartDate",
        },
      },
      {
        $project: {
          favorites: 0,
          playlists: 0,
          subscription: 0,
        },
      },
    ]);
    if (users) {
      return res.status(SUCCESS_STATUS_CODE).json({
        success: true,
        users,
      });
    } else {
      return next({ status: NOT_FOUND_STATUS_CODE, message: "User not found" });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

const getUsersInformation = async (req, res, next) => {
  try {
    const users = await User.find({});

    // console.log(users)
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
};

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

    console.log("Users created daily:", usersCreatedDaily);
    return res.status(SUCCESS_STATUS_CODE).json({
      success: true,
      usersCreatedDaily,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return next({ message: "Internal Server Error" });
  }
}

const updateSubscriptionInfo = async (req, res, next) => {
  //logger.debug("%O", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const {
      userId,
      subscriptionType,
      subscriptionReceipt,
      subscriptionStartDate,
    } = req.body;

    // Check if the user's subscription exists
    const existingSubscription = await Subscription.findOne({ userId });

    if (existingSubscription) {
      // Update the existing subscription
      existingSubscription.subscriptionType = subscriptionType;
      existingSubscription.subscriptionReceipt = subscriptionReceipt;
      existingSubscription.subscriptionStartDate = subscriptionStartDate;
      await existingSubscription.save();

      return res
        .status(200)
        .json({ success: true, message: "Subscription updated" });
    } else {
      // Create a new subscription
      const newSubscription = await Subscription.create({
        userId,
        subscriptionType,
        subscriptionReceipt,
        subscriptionStartDate,
      });

      return res.status(CREATE_STATUS_CODE).json({
        success: true,
        message: "Subscription created",
        subscription: newSubscription,
      });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Internal Server Error" });
  }
};

module.exports = {
  login,
  updateCheckIn,
  getCheckIn,
  getUsers,
  getUsersInformation,
  getUsersCreatedDaily,
  updateSubscriptionInfo,
};
