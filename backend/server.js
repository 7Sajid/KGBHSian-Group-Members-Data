require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // generous limit to fit the base64 JPG

const PORT = process.env.PORT || 4000;
const CARDS_DIR = path.join(__dirname, 'cards');

if (!fs.existsSync(CARDS_DIR)) {
  fs.mkdirSync(CARDS_DIR, { recursive: true });
}

function isValidPayload(b) {
  return (
    b &&
    typeof b.name === 'string' && b.name.trim() &&
    /^(19|20)\d{2}$/.test(String(b.batch || '').trim()) &&
    /^[0-9+\-\s]{7,15}$/.test(String(b.phone || '').trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email || '').trim()) &&
    typeof b.employment === 'string' && b.employment.trim() &&
    typeof b.blood === 'string' && b.blood.trim() &&
    typeof b.address === 'string' && b.address.trim()
  );
}

// Register a new member
app.post('/api/members', async (req, res) => {
  const body = req.body || {};

  if (!isValidPayload(body)) {
    return res.status(400).json({ error: 'Missing or invalid fields.' });
  }

  const submittedAt = new Date().toISOString();

  let row;
  try {
    row = await db.insertMember({
      name: body.name.trim(),
      batch: body.batch.trim(),
      phone: body.phone.trim(),
      email: body.email.trim(),
      employment: body.employment.trim(),
      blood: body.blood.trim(),
      address: body.address.trim(),
      location: (body.location || '').trim(),
      submittedAt
    });
  } catch (err) {
    console.error('Database error:', err.message);
    return res.status(500).json({ error: 'Failed to save registration. Please try again.' });
  }

  // Save a permanent copy of the card image on the server, if one was sent
  let cardSaved = false;
  if (body.imageBase64) {
    try {
      const safeName = body.name.trim().replace(/[^\w\-]+/g, '_');
      const filename = `${row.id}_${safeName}.jpg`;
      fs.writeFileSync(path.join(CARDS_DIR, filename), Buffer.from(body.imageBase64, 'base64'));
      cardSaved = true;
    } catch (err) {
      console.error('Failed to save card image:', err.message);
    }
  }

  res.json({ id: row.id, cardSaved });
});

// Public directory — safe fields only (no phone/email/address)
app.get('/api/members', async (req, res) => {
  try {
    res.json(await db.listMembersPublic());
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to load directory.' });
  }
});

// Total count (used for the live counter)
app.get('/api/members/count', async (req, res) => {
  try {
    res.json({ count: await db.countMembers() });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Failed to load count.' });
  }
});

// Admin-only full export as CSV — requires a token so private data (phone/email/address)
// isn't exposed to every visitor. Set ADMIN_TOKEN in your .env file.
app.get('/api/admin/export', async (req, res) => {
  if (!process.env.ADMIN_TOKEN || req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Invalid or missing admin token.' });
  }
  const rows = await db.listMembersFull();
  const headers = ['id','name','batch','phone','email','employment','blood','address','location','submittedAt'];
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="kgbhsian_members.csv"');
  res.send(csv);
});

// Admin-only: view a specific member's saved card image
app.get('/api/admin/cards/:filename', (req, res) => {
  if (!process.env.ADMIN_TOKEN || req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Invalid or missing admin token.' });
  }
  const safePath = path.join(CARDS_DIR, path.basename(req.params.filename));
  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ error: 'Card not found.' });
  }
  res.sendFile(safePath);
});

// Admin-only: list all saved card filenames
app.get('/api/admin/cards', (req, res) => {
  if (!process.env.ADMIN_TOKEN || req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Invalid or missing admin token.' });
  }
  const files = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.jpg'));
  res.json(files);
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`KGBHSian backend running on http://localhost:${PORT}`);
});
