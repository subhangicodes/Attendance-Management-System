const express = require("express");
const { markStatus,getHistory, setLoginTime, setLogoutTime } = require("../controllers/attendenceController");

const router = express.Router();


router.get("/history", getHistory);
router.post('/login', setLoginTime)
router.post('/logout', setLogoutTime);
router.post("/status", markStatus);

module.exports = router;
