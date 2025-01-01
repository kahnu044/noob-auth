const { formatDateAndTime } = require("../utils/dateAndTime");

const logger = (req, res, next) => {
  console.log(`==>> ${formatDateAndTime()} ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
