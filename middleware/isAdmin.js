module.exports = (req, res, next) => {
  if (req.user.role === 0) {
    return res.status(403).json({
      error: 'You are not ADMIN, Access denied',
    });
  }
  next();
};
