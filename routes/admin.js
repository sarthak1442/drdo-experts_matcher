const express = require("express");
const router = express.Router();
const ensureAdmin = require("../middlewares/ensureAdmin");
const jobController = require("../controllers/jobController");

// Dashboard route
router.get("/dashboard", ensureAdmin, jobController.getAdminDashboard);

// Proceed route
router.get("/proceed/:id", ensureAdmin, jobController.proceedPage);

module.exports = router;
