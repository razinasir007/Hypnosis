const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    backgroundColor: {
      type: String,
      required: true,
      default: "#fff",
    },
    textColor: {
      type: String,
      required: true,
      default: "#000",
    },
    modalFor: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
  },
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", notificationSchema);

module.exports = { Notifications };
