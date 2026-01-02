const router = require("express").Router();
const adminController = require("../controllers/adminconroller");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// 🔐 Protect ALL admin routes
router.use(authMiddleware, isAdmin);

/* ===== EMPLOYEE MANAGEMENT ===== */
router.post("/employees", adminController.addEmployee);
router.get("/employees", adminController.getEmployees);

router.delete("/employees/:id", adminController.deleteEmployee);

/* ===== ATTENDANCE ===== */
router.get("/attendance", adminController.getAllAttendance);

/* ===== LEAVE / WFH REQUESTS ===== */
router.get("/requests", adminController.getPendingRequests);
router.put("/requests/:id/approve", adminController.approveRequest);
router.put("/requests/:id/reject", adminController.rejectRequest);

/* ===== REPORTS ===== */
router.get("/reports", adminController.generateReport);

module.exports = router;
