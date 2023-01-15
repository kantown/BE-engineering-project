const mongoose = require("mongoose");

const subSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  plan: [{
    price: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      enum: ["week", "twoWeeks", "month", "threeMonths", "sixMonths", "year"],
      required: true,
    },
  }]
});

module.exports = mongoose.model("Subscription", subSchema);
