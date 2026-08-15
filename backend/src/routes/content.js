const express = require("express");
const supabase = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Whitelist of content keys the frontend is allowed to read/write.
// Keeps arbitrary keys from being created via the API.
const ALLOWED_KEYS = new Set([
  "profile",
  "skills",
  "technologies",
  "projects",
  "experience",
  "education",
  "certifications",
  "services",
  "testimonials",
  "blog"
]);

function checkKey(req, res, next) {
  if (!ALLOWED_KEYS.has(req.params.key)) {
    return res.status(404).json({ error: `Unknown content key "${req.params.key}".` });
  }
  next();
}

// GET /api/content            -> all content keys at once (used on initial page load)
router.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from("content").select("key, value");
    if (error) throw error;
    const result = {};
    (data || []).forEach((row) => {
      result[row.key] = row.value;
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/content/:key       -> public, one key
router.get("/:key", checkKey, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("content")
      .select("value")
      .eq("key", req.params.key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found." });
    res.json(data.value);
  } catch (err) {
    next(err);
  }
});

// PUT /api/content/:key       -> admin only, replaces the whole value
router.put("/:key", requireAuth, checkKey, async (req, res, next) => {
  try {
    const value = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: "Request body must be JSON." });
    }
    const { error } = await supabase
      .from("content")
      .upsert({ key: req.params.key, value }, { onConflict: "key" });
    if (error) throw error;
    res.json({ ok: true, key: req.params.key });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
