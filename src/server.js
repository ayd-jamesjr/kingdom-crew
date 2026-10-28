// Kingdom Crew Fellowship — Express server
// Serves the website from /public and provides a small REST API:
//   GET  /api/health      -> is the server alive, is the DB / AI configured?
//   GET  /api/events      -> published events from TiDB
//   POST /api/inquiries   -> save a contact-form message in TiDB
//   POST /api/chat        -> AI assistant (calls an OpenAI-compatible API)
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPool, isConfigured } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct rate limiting.

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://bible-api.com'],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  })
);

// Optional CORS, only needed if the frontend is on GitHub Pages and the API on Render.
app.use((req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin && req.headers.origin === origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '20kb' }));

// ---------- helpers ----------
const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// ---------- health ----------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: isConfigured(),
    ai: Boolean(process.env.AI_API_KEY),
  });
});

// ---------- events ----------
app.get('/api/events', async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database not configured yet.' });
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, starts_at, ends_at, venue, category, poster_url
         FROM events
        WHERE is_published = 1 AND starts_at >= NOW() - INTERVAL 1 DAY
        ORDER BY starts_at ASC
        LIMIT 20`
    );
    res.json({ events: rows });
  } catch (err) {
    console.error('events error:', err.code || err.message);
    res.status(500).json({ error: 'Could not load events.' });
  }
});

// ---------- contact form ----------
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

app.post('/api/inquiries', formLimiter, async (req, res) => {
  const b = req.body || {};
  // Honeypot: real people never fill this hidden field, bots often do.
  if (b.website) return res.json({ ok: true });

  const data = {
    name: clean(b.name, 100),
    email: clean(b.email, 150),
    category: clean(b.category, 40) || 'general',
    subject: clean(b.subject, 150),
    message: clean(b.message, 2000),
    consent: b.consent ? 1 : 0,
  };
  const allowed = ['general', 'membership', 'events', 'prayer', 'partnership', 'technical'];
  if (!allowed.includes(data.category)) data.category = 'general';

  if (data.name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!emailOk(data.email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (data.subject.length < 3) return res.status(400).json({ error: 'Please add a subject.' });
  if (data.message.length < 10) return res.status(400).json({ error: 'Please write a longer message (10+ characters).' });
  if (!data.consent) return res.status(400).json({ error: 'Please agree to be contacted.' });

  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Messages cannot be saved yet. Please email us directly.' });

  try {
    // Parameterized query (the ? marks) prevents SQL injection.
    await pool.execute(
      `INSERT INTO inquiries (name, email, category, subject, message, consent) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.email, data.category, data.subject, data.message, data.consent]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('inquiry error:', err.code || err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again or email us.' });
  }
});

// ---------- AI assistant ----------
const chatLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const SYSTEM_PROMPT = `You are the Kingdom Crew Assistant, a friendly helper on the website of Kingdom Crew Fellowship, a Christian student fellowship at the University of Lay Adventists of Kigali (UNILAK), Rwamagana Campus, Rwanda.
You help visitors with: (1) questions about the fellowship, (2) understanding Bible passages, themes and context, and (3) gentle encouragement.
Facts you may state about the fellowship: it meets every Sunday from 4:30 PM to 7:00 PM at the Former Exam Hall, UNILAK Rwamagana Campus; email kingdomcrew.unilak@gmail.com; phones 0791377615 and 0794242323.
Do not invent leaders, doctrines, events, dates or denominational positions. If you do not know something about the fellowship, say so and point to the email or phones.
When explaining Scripture, name the passage, give context, then a plain-language meaning and a practical takeaway. Note that sincere Christians sometimes interpret passages differently. Do not quote long passages; refer to them by reference.
You are an AI, not a pastor or counselor. If someone seems to be in crisis or mentions harming themselves or others, respond with warmth, encourage them to contact a trusted person or local emergency services right away, and suggest they reach out to fellowship leaders.
Keep answers short (under 180 words) and kind, in simple English.`;

app.post('/api/chat', chatLimiter, async (req, res) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'The AI assistant has not been connected yet.' });

  const incoming = Array.isArray(req.body?.messages) ? req.body.messages.slice(-10) : [];
  const messages = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Please type a question.' });
  }

  const base = (process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
  const models = [process.env.AI_MODEL || 'llama-3.3-70b-versatile', process.env.AI_FALLBACK_MODEL].filter(Boolean);

  async function callModel(model) {
    return fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1500,
        temperature: 0.5,
        ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
      }),
    });
  }

  try {
    let r;
    // Try the main model; if it is rate-limited (429) or the provider errors (5xx), try the fallback once.
    for (const model of models) {
      r = await callModel(model);
      if (r.ok || (r.status !== 429 && r.status !== 404 && r.status < 500)) break;
      console.error(`AI model ${model} returned ${r.status}, trying fallback if any`);
    }
    if (!r.ok) {
      console.error('AI provider status:', r.status);
      const friendly = r.status === 401 ? 'The AI key is not valid.' : r.status === 429 ? 'The assistant is very busy right now. Please try again in a few minutes.' : 'The AI service had a problem.';
      return res.status(502).json({ error: friendly });
    }
    const json = await r.json();
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: 'The AI returned an empty answer.' });
    res.json({ reply });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(502).json({ error: 'Could not reach the AI service.' });
  }
});

// ---------- static website ----------
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Kingdom Crew server running on port ${PORT}`));
