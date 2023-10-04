const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "can't be blank"] },
    type: { type: String, required: [true, "can't be blank"] },
    summary: { type: String, required: [true, "can't be blank"] },
    length: { type: String, required: [true, "can't be blank"] },
    size: { type: String, required: [true, "can't be blank"] },
    url: { type: String },
    productID: {
      type: String,
      required: [true, "can't be blank"],
      unique: [true, "Product id must be unique"],
    },
    image: { type: String, required: [true, "can't be blank"] },
    night: { type: Boolean },
    published: { type: String },
    isPremium: { type: Boolean },
    googleID: { type: String },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    status: { type: String, required: true, default: "active" },
  },
  { timestamps: true }
);

const Audio = mongoose.model("Audio", audioSchema);

module.exports = { Audio };
