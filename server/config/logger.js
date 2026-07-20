import winston from 'winston';

const isProd = process.env.NODE_ENV === 'production';

// Structured JSON logs in production (for log aggregators); colorized,
// human-readable lines in development.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProd
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
        )
      ),
  transports: [new winston.transports.Console()],
});

// Stream adapter so Morgan writes HTTP request lines through Winston.
export const morganStream = {
  write: (message) => logger.info(message.trim()),
};

export default logger;
