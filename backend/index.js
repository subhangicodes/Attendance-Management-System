const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDB } = require("./config/db");
const attendanceRoutes = require("../backend/routes/attendenceRoutes");
const authRoutes = require("../backend/routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from backend" });
});

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", require("./routes/adminroutes"));


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
