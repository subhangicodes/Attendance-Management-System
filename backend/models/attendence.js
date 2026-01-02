const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

 
    workDate: {
      type: String, // YYYY-MM-DD
      required: true,
      default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
    },

    loginTime: {
      type: Date,
      required: true,
      default: Date.now,
    },

    logoutTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "WFH", "Leave"],
      required: true,
    },

    approvalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Approved", // Present is auto approved
  },
  },
  { timestamps: true }
);

// One active session per user
attendanceSchema.index({ userId: 1, logoutTime: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
