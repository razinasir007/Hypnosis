const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name can't be blank"] },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Email can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    image: { type: String },
    lastCheckInDate: { type: Date },
    consecutiveStreak: { type: Number, default: 0 },
    emailOptIn:{type:Boolean,default:false}
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

const User = mongoose.model("User", UserSchema);

module.exports = { User };
