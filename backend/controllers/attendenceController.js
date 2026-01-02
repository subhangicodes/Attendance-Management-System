const Attendance = require("../models/attendence");
const User = require("../models/user");

/* ================= HELPER ================= */
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/* ================= LOGIN =================
   Real-world logic:
   - Login creates/updates TODAY record
   - First login = loginTime
   - Re-login after logout updates loginTime again
========================================== */
exports.setLoginTime = async (req, res) => {
  try {
    const { employeeId, userId } = req.body;

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ employeeId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { start, end } = getTodayRange();

    let attendance = await Attendance.findOne({
      userId: user._id,
      workDate: { $gte: start, $lte: end },
    });

    // 🟢 create record if first action today
    if (!attendance) {
      attendance = await Attendance.create({
        userId: user._id,
        workDate: start,
        status: "Present",
        loginTime: new Date(),
        logoutTime: null,
      });

      return res.json({ message: "Login successful", attendance });
    }

    // 🟡 already logged in
    if (attendance.loginTime && !attendance.logoutTime) {
      return res.json({ message: "Already logged in", attendance });
    }

    // 🔁 re-login after logout
    attendance.loginTime = new Date();
    attendance.logoutTime = null;
    attendance.status = "Present";
    await attendance.save();

    res.json({ message: "Login successful", attendance });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= LOGOUT =================
   - Updates last logoutTime
   - Does NOT create new record
=========================================== */
exports.setLogoutTime = async (req, res) => {
  try {
    const { employeeId, userId } = req.body;

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ employeeId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      userId: user._id,
      workDate: { $gte: start, $lte: end },
    });

    if (!attendance || !attendance.loginTime) {
      return res.status(400).json({
        message: "Login first before logout",
      });
    }

    if (attendance.logoutTime) {
      return res.json({
        message: "Already logged out",
        attendance,
      });
    }

    attendance.logoutTime = new Date();
    await attendance.save();

    res.json({ message: "Logout successful", attendance });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};

/* ================= STATUS (WFH / LEAVE) =================
   - Allowed only BEFORE login
   - No login/logout time for Leave
   - WFH can later login
========================================================= */
exports.markStatus = async (req, res) => {
  try {
    const { employeeId, userId, status } = req.body;

    if (!["WFH", "Leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ employeeId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { start, end } = getTodayRange();

    let attendance = await Attendance.findOne({
      userId: user._id,
      workDate: { $gte: start, $lte: end },
    });

    // 🚫 cannot change after login
    if (attendance?.loginTime) {
      return res.status(400).json({
        message: "Logout before changing status",
      });
    }

    if (!attendance) {
      attendance = await Attendance.create({
        userId: user._id,
        workDate: start,
        status,
        loginTime: null,
        logoutTime: null,
      });
    } else {
      attendance.status = status;
      attendance.loginTime = null;
      attendance.logoutTime = null;
      await attendance.save();
    }

    res.json({ message: `${status} marked`, attendance });
  } catch (err) {
    console.error("STATUS ERROR:", err);
    res.status(500).json({ message: "Status update failed" });
  }
};

/* ================= HISTORY =================
   - Always includes today
   - Sorted by date
================================================ */
exports.getHistory = async (req, res) => {
  try {
    const { employeeId, userId, days = 30 } = req.query;

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ employeeId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const from = new Date();
    from.setDate(from.getDate() - Number(days));
    from.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      userId: user._id,
      workDate: { $gte: from },
    }).sort({ workDate: 1 });

    res.json({ records });
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "History fetch failed" });
  }
};
