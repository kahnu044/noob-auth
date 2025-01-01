const checkClientUrl = (req, res, next) => {
  const clientUrl = req.headers?.clienturl;
  if (!clientUrl) {
    return res.status(401).json({
      status: false,
      message: "Please provide clientUrl in header",
    });
  }
  next();
};

module.exports = checkClientUrl;
