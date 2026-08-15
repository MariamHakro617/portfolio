const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const LOGIN_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 8;
const attempts = new Map(); // ip -> [timestamps]

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - LOGIN_RATE_LIMIT_WINDOW_MS;
  const recent = (attempts.get(ip) || []).filter((t) => t > windowStart);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > LOGIN_RATE_LIMIT_MAX;
}

router.post("/login", async (req, res, next) => {
  try {
    const ip = req.ip;
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: "Too many login attempts. Try again in a minute." });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, username: user.username, expiresIn: "12h" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
