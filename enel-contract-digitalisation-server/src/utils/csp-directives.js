const absoluteUrl = process.env.ABSOLUTE_URL || "http://localhost:3000";

const cspDirectives = {
  defaultSrc: [
    "'self'",
    "https://fonts.googleapis.com/css",
    (req, res) => `'nonce-${res.locals.nonce}'`,
  ],
  scriptSrc: [
    "'self'",
    "'unsafe-eval'",
    "https://cdn.userway.org",
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/",
    "https://developers.google.com/",
    "https://assets.adobedtm.com/",
    `${absoluteUrl}/assets/js/jquery.min.js`,
    `${absoluteUrl}/v2/index.js`,
    `${absoluteUrl}/assets/js/jquery.min.js`,
    `${absoluteUrl}/assets/js/ie10-viewport-bug-workaround.js`,
    (req, res) => `'nonce-${res.locals.nonce}'`,
  ],
  fontSrc: [
    "'self'",
    "https://fonts.googleapis.com/css",
    "https://*.gstatic.com/",
    "https://cdn.userway.org",
  ],
  imgSrc: [
    "'self'",
    `data:`,
    `https://cdn.userway.org`,
    `${absoluteUrl}/imgs/`,
    `${absoluteUrl}`,
  ],
  objectSrc: ["'none'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://*.googleapis.com",
    `${absoluteUrl}/bootstrap/css/bootstrap.css`,
    `${absoluteUrl}/style.css`,
    `${absoluteUrl}/responsive.css`,
    "https://cdn.userway.org",
  ],
  frameSrc: [
    "'self'",
    "https://*.google.com/",
    "https://www.google.com/recaptcha/",
    "https://*.gstatic.com",
    "https://cdn.userway.org",
  ],
  connectSrc: [
    "'self'",
    "https://*.google.com",
    "https://telesales-pre.pecenergy.ro",
    "https://telesales.pecenergy.ro",
    "https://doc-pre.pecenergy.ro",
    "https://doc.pecenergy.ro",
    "https://cdn.userway.org",
    "https://api.userway.org",
    absoluteUrl, // Add your own domain
  ],
};

module.exports = {
  cspDirectives,
};
