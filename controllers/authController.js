

const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

// Render Signup Page
exports.getSignupPage = (req, res) => {
  res.render("signup");
};

// Handle Signup Logic
exports.signup = async (req, res) => {
  const { username, email, phone, id, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await Admin.findOne({ id });
    if (existingUser) {
      return res.render("signup", { error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newAdmin = new Admin({
      username,
      email,
      phone,
      id,
      password: hashedPassword,
    });
    await newAdmin.save();

    // Set session and redirect to dashboard
    req.session.user = newAdmin;
    res.redirect("/Job-dashboard");
    //res.render("admin-dashboard");
  } catch (error) {
    console.error(error);
    res.render("signup", { error: "An error occurred during signup" });
  }
};

// Render Login Page
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// Handle Login Logic
exports.login = async (req, res) => {
  const { id, password } = req.body;

  try {
    // Check if user exists
    const user = await Admin.findOne({ id });
    if (!user) {
      return res.render("login", { error: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid credentials" });
    }

    // Set session and redirect to dashboard
    req.session.user = user;
    res.redirect("/Job-dashboard");
    //res.render("admin-dashboard");
  } catch (error) {
    console.error(error);
    res.render("login", { error: "An error occurred during login" });
  }
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/Job-dashboard");
    }
    res.redirect("/");
  });
};


// Render add-candidate Page
exports.getAddCandidatePage = (req, res) => {
  res.render("add-candidate");
};

// Handle Login Logic

