const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true },
  purpose: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: String,
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);