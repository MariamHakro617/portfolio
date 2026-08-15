// Vercel serverless entry point. Vercel builds every file under /api/ as
// its own serverless function; this one just re-exports the Express app
// from src/server.js, so all routes (/api/auth, /api/content, ...) work
// exactly the same as running it locally with `npm start`.
module.exports = require("../src/server");
