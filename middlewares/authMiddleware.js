
exports.authMiddleware = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/auth/login");
};