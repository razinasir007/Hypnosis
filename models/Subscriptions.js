const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique:true,
    },
    subscriptionType: { type: String, required: true, default: "none" },
    subscriptionReceipt: { type: String }, //make a separate table
    subscriptionStartDate: { type: Date },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Subscription };
