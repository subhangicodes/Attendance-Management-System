// controllers/adminController.js

const User = require("../models/user");
const Attendance = require("../models/attendence");
const bcrypt = require("bcryptjs");

/* ================= EMPLOYEES ================= */

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    res.json({ employees });
  } catch {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const { employeeId, name, password } = req.body;

    if (!employeeId || !name || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ employeeId });
    if (exists) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      employeeId,
      name,
      password: hashedPassword,
      role: "employee",
    });

    res.status(201).json({ message: "Employee added", user });
  } catch {
    res.status(500).json({ message: "Failed to add employee" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({ userId: req.params.id }); // cleanup
    res.json({ message: "Employee deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= ATTENDANCE ================= */

exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("userId", "employeeId name")
      .sort({ workDate: -1 });

    res.json({ records });
  } catch {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

/* ================= REQUESTS ================= */

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Attendance.find({
      status: { $in: ["WFH", "Leave"] },
      approved: { $ne: true },
    }).populate("userId", "employeeId name");

    res.json({ requests });
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Request not found" });

    record.approved = true;
    record.approvedBy = req.user._id;
    record.approvedAt = new Date();

    await record.save();
    res.json({ message: "Request approved" });
  } catch {
    res.status(500).json({ message: "Approval failed" });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Request not found" });

    record.status = "Absent";
    record.approved = false;
    record.rejectedBy = req.user._id;
    record.rejectedAt = new Date();

    await record.save();
    res.json({ message: "Request rejected" });
  } catch {
    res.status(500).json({ message: "Reject failed" });
  }
};

/* ================= REPORT ================= */

exports.generateReport = async (req, res) => {
  try {
    const report = await Attendance.aggregate([
      {
        $group: {
          _id: { userId: "$userId", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.userId",
          summary: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
    ]);

    res.json({ report });
  } catch {
    res.status(500).json({ message: "Report generation failed" });
  }
};
