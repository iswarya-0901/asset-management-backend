const express = require("express");
const router = express.Router();

const Asset = require("../models/asset");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= CREATE ASSET (ADMIN) ================= */
router.post("/add", auth, role(["admin"]), async (req, res) => {
  try {
    const asset = new Asset({
      ...req.body,
      totalQuantity: req.body.quantity,  // ✅ add this line
    });
    await asset.save();

    res.json({ message: "Asset created", asset });
  } catch (err) {
    res.status(500).json({ message: "Error creating asset" });
  }
});

/* ================= MY BOOKINGS ================= */
router.get("/my-bookings", auth, async (req, res) => {
  const assets = await Asset.find({ bookedBy: req.user.id });
  res.json(assets);
});
/* ================= GET ALL ================= */
router.get("/", auth, async (req, res) => {
  const assets = await Asset.find();
  res.json(assets);
});

/* ================= DELETE ================= */
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  await Asset.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ================= BOOK ASSET (USER) ================= */
/* ================= BOOK ASSET (USER) ================= */
router.put("/book/:id", auth, async (req, res) => {
  try {
    const { purpose, startDate, endDate, quantity } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Not found" });

    if (asset.status === "booked" || asset.quantity < 1)
      return res.status(400).json({ message: "Already booked" });

    const qty = parseInt(quantity);
    if (!qty || qty <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    if (qty > asset.quantity)
      return res.status(400).json({ message: `Only ${asset.quantity} available` });
    if (!asset.totalQuantity) asset.totalQuantity = asset.quantity; 
    asset.bookedQuantity = qty;
    asset.quantity -= qty;
    if (asset.quantity === 0) asset.status = "booked";

    asset.bookedBy = req.user.id;
    asset.purpose = purpose;
    asset.startDate = startDate;
    asset.endDate = endDate;

    await asset.save();
    res.json({ message: "Booked successfully", asset });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});
router.put("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    // if status is being set to available, clear bookedBy
    if (req.body.status === "available") {
      req.body.bookedBy = null;
    }

    const updated = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: "Updated", asset: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating asset" });
  }
});



module.exports = router;