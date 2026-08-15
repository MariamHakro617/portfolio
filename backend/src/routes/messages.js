const express = require("express");
const crypto = require("crypto");
const supabase = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function isValidEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// POST /api/messages   -> public, contact form submission
router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || name.trim().length < 2) return res.status(400).json({ error: "Name is required." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "A valid email is required." });
    if (!subject || subject.trim().length < 3) return res.status(400).json({ error: "Subject is required." });
    if (!message || message.trim().length < 10) return res.status(400).json({ error: "Message is too short." });

    const id = "m" + crypto.randomUUID();
    const { error } = await supabase.from("messages").insert({
      id,
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      subject: subject.trim(),
      message: message.trim()
    });
    if (error) throw error;

    res.status(201).json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

// GET /api/messages    -> admin only
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/messages/:id  -> admin only, mark read
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", req.params.id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/messages/:id -> admin only
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", req.params.id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
