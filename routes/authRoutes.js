const express = require("express");

const authController = require("../controllers/authController");
const router = express.Router();

// Signup route
router.get("/signup", authController.getSignupPage);
router.post("/signup", authController.signup);

// Login route
router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);

// Logout route
router.get("/logout", authController.logout);



module.exports = router;
