require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ================= CORS ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ❌ REMOVE app.options("*", cors()) COMPLETELY */

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= ROUTES ================= */
const authRoutes = require("./routes/authroutes");
const assetRoutes = require("./routes/assetRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Asset Management Backend Running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working fine" });
});

/* ================= DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));