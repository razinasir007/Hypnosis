const { validationResult } = require("express-validator");
const { logger } = require("../logger");
const { NotificationFields } = require("../models/NotificationFields");
const { Notifications } = require("../models/Notifications");
const {
  BAD_REQUEST_STATUS_CODE,
  CREATE_STATUS_CODE,
  SUCCESS_STATUS_CODE,
} = require("../config/config");

const addNewNotification = async (req, res, next) => {
  //   logger.debug("%O", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }

  try {
    const { title, backgroundColor, fields, status, textColor, modalFor } =
      req.body;

    if (modalFor === "all" && status === "active") {
      await Notifications.updateMany(
        { status: "active" },
        { status: "inactive" }
      );
    } else if (modalFor === "subscribers" && status === "active") {
      await Notifications.updateMany(
        { modalFor: { $in: ["subscribers", "all"] }, status: "active" },
        { status: "inactive" }
      );
    } else if (modalFor === "non-subscribers" && status === "active") {
      await Notifications.updateMany(
        { modalFor: { $in: ["non-subscribers", "all"] }, status: "active" },
        { status: "inactive" }
      );
    }

    if (fields && fields.length > 0) {
      const notif = await Notifications.create({
        title,
        backgroundColor,
        textColor,
        modalFor,
        status,
      });
      const newFields = fields.map((field) => {
        return {
          ...field,
          notificationId: notif._id,
        };
      });
      const createdFields = await NotificationFields.create(newFields);

      return res
        .status(201)
        .json({ success: true, notification: notif, fields: createdFields });
    } else {
      return next({ message: "Notification must atleast have one field" });
    }
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not added" });
  }
};

const getActiveNotification = async (req, res, next) => {
  try {
    const notifications = await Notifications.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "notificationfields",
          localField: "_id",
          foreignField: "notificationId",
          as: "fields",
        },
      },
      { $unwind: "$fields" },
      { $sort: { "fields.position": 1 } },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          backgroundColor: { $first: "$backgroundColor" },
          textColor: { $first: "$textColor" },
          status: { $first: "$status" },
          modalFor: { $first: "$modalFor" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
          fields: { $push: "$fields" },
        },
      },
    ]).exec();

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not added" });
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notifications.aggregate([
      {
        $lookup: {
          from: "notificationfields",
          localField: "_id",
          foreignField: "notificationId",
          as: "fields",
        },
      },
      { $unwind: "$fields" },
      { $sort: { "fields.position": 1 } },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          backgroundColor: { $first: "$backgroundColor" },
          textColor: { $first: "$textColor" },
          status: { $first: "$status" },
          modalFor: { $first: "$modalFor" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
          fields: { $push: "$fields" },
        },
      },
    ]).exec();

    return res.status(200).json({ success: true, modals: notifications });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not added" });
  }
};
const getFieldsById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { id } = req.params;

    const fields = await NotificationFields.find({ notificationId: id });
    // console.log(fields);
    return res.status(200).json({ success: true, fields });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not Found" });
  }
};

const deleteModal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { id } = req.params;

    const notif = await Notifications.findOneAndDelete({ _id: id });
    const fields = await NotificationFields.deleteMany({ notificationId: id });
    return res.status(200).json({ success: true, notif });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not Deleted" });
  }
};

const updateModal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: BAD_REQUEST_STATUS_CODE,
      message: "Validation Error",
      type: errors.array(),
    });
  }
  try {
    const { id } = req.params;
    const { title, backgroundColor, status, textColor, modalFor } = req.body;

    if (modalFor === "all" && status === "active") {
      await Notifications.updateMany(
        { status: "active" },
        { status: "inactive" }
      );
    } else if (modalFor === "subscribers" && status === "active") {
      await Notifications.updateMany(
        { modalFor: { $in: ["subscribers", "all"] }, status: "active" },
        { status: "inactive" }
      );
    } else if (modalFor === "non-subscribers" && status === "active") {
      await Notifications.updateMany(
        { modalFor: { $in: ["non-subscribers", "all"] }, status: "active" },
        { status: "inactive" }
      );
    }

    const notif = await Notifications.findOneAndUpdate(
      { _id: id },
      { title, backgroundColor, status, textColor, modalFor }
    );
    return res.status(200).json({ success: true, notif });
  } catch (error) {
    logger.error("%O", error);
    return next({ message: "Notification not Deleted" });
  }
};

module.exports = {
  addNewNotification,
  getActiveNotification,
  getAllNotifications,
  getFieldsById,
  deleteModal,
  updateModal,
};
