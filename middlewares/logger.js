const { formatDateAndTime } = require("../utils/dateAndTime");

const logger = (req, res, next) => {
    res.on('finish', () => {
      console.log(
        `==>> ${formatDateAndTime()} ${req.method} ${req.url} ${res.statusCode}`
      );
    });

    next();
  };

module.exports = logger;
