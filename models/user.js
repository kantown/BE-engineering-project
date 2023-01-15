const mongoose = require("mongoose");
const validator = require("validator");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => validator.isEmail(value),
  },
  subs: [{
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    period: {
      type: String,
      enum: ["week", "twoWeeks", "month", "threeMonths", "sixMonths", "year"], 
    },
    payment: {
      type: Date,
    },
  }],
  isAdmin: {
    type: Boolean
  }
});

module.exports = model("User", userSchema);
