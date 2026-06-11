const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Asset = require("../models/asset");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ── Create booking request ── */
router.post("/", auth, async (req, res) => {
  try {
    const { assetId, quantity, purpose, startDate, endDate } = req.body;
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    if (quantity > asset.quantity)
      return res.status(400).json({ message: `Only ${asset.quantity} available` });

    const booking = new Booking({
      asset: assetId,
      bookedBy: req.user.id,
      quantity,
      purpose,
      startDate,
      endDate,
    });
    await booking.save();
    res.json({ message: "Booking request submitted", booking });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});

/* ── My bookings ── */
router.get("/my", auth, async (req, res) => {
  const bookings = await Booking.find({ bookedBy: req.user.id })
    .populate("asset", "name type")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

/* ── Pending bookings (admin) ── */
router.get("/pending", auth, role(["admin"]), async (req, res) => {
  const bookings = await Booking.find({ status: "pending" })
    .populate("asset", "name type")
    .populate("bookedBy", "name email")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

/* ── All bookings (admin) ── */
router.get("/all", auth, role(["admin"]), async (req, res) => {
  const bookings = await Booking.find()
    .populate("asset", "name type")
    .populate("bookedBy", "name email")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

/* ── Approve ── */
router.put("/:id/approve", auth, role(["admin"]), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const asset = await Asset.findById(booking.asset);
    if (booking.quantity > asset.quantity)
      return res.status(400).json({ message: "Not enough quantity available" });

    asset.quantity -= booking.quantity;
    if (asset.quantity === 0) asset.status = "booked";
    await asset.save();

    booking.status = "approved";
    await booking.save();
    res.json({ message: "Approved", booking });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ── Reject ── */
router.put("/:id/reject", auth, role(["admin"]), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "rejected";
    booking.rejectionReason = req.body.reason || "";
    await booking.save();
    res.json({ message: "Rejected", booking });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

module.exports = router;