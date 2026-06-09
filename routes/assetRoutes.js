const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
// CREATE asset
router.post("/add",auth,roleCheck(["admin"]), async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.json({ message: "Asset created successfully", asset });
  } catch (err) {
    res.status(500).json({ message: "Error creating asset" });
  }
});

// GET all assets
router.get("/",auth, async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assets" });
  }
});

router.delete("/:id",auth,roleCheck(["admin"]), async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: "Asset deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting asset" });
  }
});

router.put("/:id",auth,roleCheck(["admin"]), async (req, res) => {
  try {
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating asset" });
  }
});


router.put("/book/:id", auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status === "booked") {
      return res.status(400).json({ message: "Already booked" });
    }

    asset.status = "booked";

    // 👇 IMPORTANT: store user
    asset.bookedBy = req.user.id;

    await asset.save();

    res.json({
      message: "Asset booked successfully",
      asset,
    });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});

router.get("/my-bookings", auth, async (req, res) => {
  try {
    const assets = await Asset.find({
      bookedBy: req.user.id,
    });

    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});
module.exports = router;