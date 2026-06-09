require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);


const assetRoutes = require("./routes/assetRoutes");
app.use("/api/assets", assetRoutes);
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
app.get("/", (req, res) => {
  res.send("Asset Management Backend Running");
});

const PORT = process.env.PORT || 5000;

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from Backend!",
  });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

