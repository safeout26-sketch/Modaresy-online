import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AccessToken } from 'livekit-server-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, TEACHER_CODE, PORT = 3000 } = process.env;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('⚠️  ملف .env ناقص: أضف LIVEKIT_URL و LIVEKIT_API_KEY و LIVEKIT_API_SECRET');
}

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const ROOM_RE = /^[a-zA-Z0-9_-]{3,40}$/;
const teacherOk = (code) => !TEACHER_CODE || code === TEACHER_CODE;

// ---- توكن الدخول: المفتاح السري يبقى هنا فقط ----
app.post('/api/token', express.json({ limit: '4kb' }), async (req, res) => {
  try {
    const { name, room, role, code } = req.body || {};
    const cleanName = String(name || '').trim().slice(0, 40);
    if (!cleanName) return res.status(400).json({ error: 'اكتب اسمك أولًا' });
    if (!ROOM_RE.test(room || '')) return res.status(400).json({ error: 'اسم الغرفة لازم يكون حروف إنجليزية وأرقام (٣ إلى ٤٠)' });

    const isTeacher = role === 'teacher';
    if (isTeacher && !teacherOk(code)) return res.status(403).json({ error: 'كود المدرّس غير صحيح' });

    const identity = `${cleanName.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 20) || 'user'}-${crypto.randomBytes(3).toString('hex')}`;
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: cleanName,
      metadata: JSON.stringify({ role: isTeacher ? 'teacher' : 'student' }),
      ttl: '6h',
    });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });
    res.json({ token: await at.toJwt(), url: LIVEKIT_URL, identity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// ---- رفع PDF (بديل لـ Firebase Storage) ----
app.post('/api/upload', express.raw({ type: 'application/pdf', limit: '25mb' }), (req, res) => {
  if (!teacherOk(req.get('x-teacher-code'))) return res.status(403).json({ error: 'غير مسموح' });
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || buf.length < 5 || buf.subarray(0, 4).toString() !== '%PDF') {
    return res.status(400).json({ error: 'الملف ليس PDF' });
  }
  const file = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
  fs.writeFileSync(path.join(uploadDir, file), buf);
  res.json({ url: `/uploads/${file}` });
});
app.use('/uploads', express.static(uploadDir, { setHeaders: (r) => r.setHeader('Content-Type', 'application/pdf') }));

app.get('/api/health', (_q, r) => r.json({ ok: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
