const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "can't be blank"],
      unique: true,
    },
    desc: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    subCategories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SubCategory",
    },
    status: { type: String, required: true, default: "active" },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category };
