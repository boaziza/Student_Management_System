const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max:      parseInt(process.env.RATE_LIMIT_MAX       || '100'),    // max requests per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: 'Too many requests, please try again later' },
});

module.exports = rateLimiter;
