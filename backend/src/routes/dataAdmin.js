const express = require("express");
const supabase = require("../db");
const { requireAuth } = require("../middleware/auth");
const { DEFAULT_DATA } = require("../seedData");

const router = express.Router();

// POST /api/data/reset -> admin only, overwrites all content with the default seed data
router.post("/reset", requireAuth, async (_req, res, next) => {
  try {
    const rows = Object.entries(DEFAULT_DATA).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("content").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    res.json({ ok: true, resetKeys: Object.keys(DEFAULT_DATA) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
