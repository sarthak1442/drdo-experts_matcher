module.exports = (req, res, next) => {
  // Dummy check, replace with actual logic
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.redirect("/login");
};
