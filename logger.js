const winston = require("winston");
const { format } = winston;
const { timestamp, json, prettyPrint, combine, printf, colorize, splat,align } =
  format;

// Define the Winston logger configuration
const logger = winston.createLogger({
  level: "debug",
  levels: winston.config.syslog.levels, // or any other level you prefer
  transports: [
    new winston.transports.Console({
      format: combine(
        // cli(),
        colorize(),
        splat(),
        align(),
        printf((info) => {
          return `${info.level}: ${info.message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: "logs.log",
      format: combine(timestamp(),splat(), json(), prettyPrint()),
    }), // Log to a file
  ],
});

// Export the logger instance
module.exports = { logger };
