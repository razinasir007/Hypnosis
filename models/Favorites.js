const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Favorites = mongoose.model("Favorites", favoritesSchema);

module.exports = { Favorites };
