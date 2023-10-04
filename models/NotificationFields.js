const mongoose = require("mongoose");

const notificationFieldSchema = new mongoose.Schema(
  {
    notificationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notifications",
        required: true,
    },
    data: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isBold: {
      type: Boolean,
    },
    align: {
      type: String,
    },
    color: {
      type: String,
    },
    fontSize: {
      type: Number,
    },
    position:{
        type:Number,
        required:true
    }
  },
  { timestamps: true }
);

const NotificationFields = mongoose.model(
  "NotificationFields",
  notificationFieldSchema
);

module.exports = { NotificationFields };
