const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String },
    emailAddresses: [
      {
        type: String,
        unique: true,
      },
    ],
    profileImageUrl: { type: String },
    userId: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);


const Admin = mongoose.model("Admin", adminSchema);

module.exports = { Admin };
