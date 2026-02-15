const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}

const fs = require('fs');
const path = require('path');

const multer = require('multer');

// ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g,'');
    cb(null, safe);
  }
});
const upload = multer({ storage });

const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: (process.env.SMTP_SECURE === 'true'),
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

app.post('/api/contact', async (req, res) => {
  try{
    const data = req.body || {};
    const name = data.name || '';
    const email = data.email || '';
    if(!name || !email) return res.status(422).json({ error: 'Name and email are required' });

    const company = data.company || '';
    const budget = data.budget || '';
    const timeline = data.timeline || '';
    const summary = data.summary || '';
    const nda = data.nda ? 'Yes' : 'No';

    const to = process.env.CONTACT_TO || 'chintu@chintuenterprises.in';
    const from = process.env.FROM_ADDRESS || (process.env.SMTP_USER || `no-reply@${req.hostname}`);
    const subject = `New contact from ${name}`;
    const text = `New contact from ${name}\nEmail: ${email}\nCompany: ${company}\nBudget: ${budget}\nTimeline: ${timeline}\nNDA: ${nda}\n\nSummary:\n${summary}`;
    const html = `
      <h2>New contact — ${escapeHtml(name)}</h2>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p><strong>Budget:</strong> ${escapeHtml(budget)}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>
      <p><strong>NDA required:</strong> ${escapeHtml(nda)}</p>
      <h3>Summary</h3>
      <p>${escapeHtml(summary).replace(/\n/g,'<br/>')}</p>
    `;

    await transporter.sendMail({ from, to, subject, text, html });

    // persist submission to file for admin retrieval
    try{
      let list = [];
      if(fs.existsSync(SUBMISSIONS_FILE)){
        const raw = fs.readFileSync(SUBMISSIONS_FILE,'utf8');
        list = raw ? JSON.parse(raw) : [];
      }
      const record = { name, email, company, budget, timeline, summary, nda, date: new Date().toISOString() };
      list.unshift(record);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    }catch(err){ console.warn('failed to persist submission', err); }

    return res.json({ ok: true });
  }catch(err){
    console.error('contact send error', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET submissions for admin (optional ADMIN_KEY check)
app.get('/api/submissions', (req, res) => {
  try{
    const adminKey = process.env.ADMIN_KEY;
    if(adminKey){
      const provided = req.get('x-admin-key') || req.query.key;
      if(provided !== adminKey) return res.status(401).json({ error: 'unauthorized' });
    }
    let list = [];
    if(fs.existsSync(SUBMISSIONS_FILE)){
      const raw = fs.readFileSync(SUBMISSIONS_FILE,'utf8');
      list = raw ? JSON.parse(raw) : [];
    }
    res.json(list);
  }catch(err){ res.status(500).json({ error: 'failed to read submissions' }); }
});

app.get('/api/health', (_,res)=> res.json({ok:true}));

// serve static site and uploaded assets from the project root
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(UPLOADS_DIR));

// upload endpoint for admin image uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try{
    const adminKey = process.env.ADMIN_KEY;
    if(adminKey){
      const provided = req.get('x-admin-key') || req.query.key;
      if(provided !== adminKey) return res.status(401).json({ error: 'unauthorized' });
    }
    if(!req.file) return res.status(400).json({ error: 'no file' });
    const url = `/uploads/${req.file.filename}`;
    return res.json({ ok: true, url });
  }catch(err){
    console.error('upload error', err);
    return res.status(500).json({ error: 'upload failed' });
  }
});

app.listen(PORT, ()=> console.log(`Contact server running on port ${PORT}`));
