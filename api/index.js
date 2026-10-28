// Vercel serverless entry: all /api/* requests are handled by the Express app in server.js.
// The React site itself is served as static files from web/dist (see vercel.json).
module.exports = require('../server.js');
