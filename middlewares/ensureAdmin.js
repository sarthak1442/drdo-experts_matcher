module.exports = (req, res, next) => {
  const user = req.session.user;
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.redirect("/login");
};
