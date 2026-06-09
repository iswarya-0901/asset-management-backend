const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "available",
  },
  bookedBy: {
  type: String, // user id or email
  default: null,
},
});

module.exports = mongoose.model("Asset", assetSchema);