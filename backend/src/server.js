require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const messagesRoutes = require("./routes/messages");
const dataAdminRoutes = require("./routes/dataAdmin");

// Seeding is a one-time step now — run `npm run seed` yourself before the
// first deploy (see README). We don't call it on every server start anymore:
// on a serverless platform the server "starts" on every cold start, and
// hitting Supabase with a seed check on every request would be wasteful.

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_DIR = path.join(__dirname, "..", "..", "frontend");

app.use(
  helmet({
    contentSecurityPolicy: false // the frontend loads fonts from Google Fonts; keep this simple for a student/portfolio project
  })
);
// If the frontend is deployed on a different domain (e.g. Vercel) than this
// backend, set CORS_ORIGIN in the environment to that domain, e.g.
// CORS_ORIGIN=https://mariam-portfolio.vercel.app
// Left unset (default) it stays wide open, which is fine when frontend and
// backend are served from the same origin.
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {}));
app.use(express.json({ limit: "100kb" }));

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/data", dataAdminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// --- Static frontend ---
app.use(express.static(FRONTEND_DIR));

// Any non-API GET falls back to index.html-relative routing handled by the static server above;
// explicit 404 for unmatched API routes so it doesn't silently fall through to the frontend.
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

// Vercel (and other serverless platforms) import this file as a module and
// call the exported app directly — they manage the listening port
// themselves, so app.listen() must not run there.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
    console.log(`Serving frontend from ${FRONTEND_DIR}`);
  });
}

module.exports = app;
