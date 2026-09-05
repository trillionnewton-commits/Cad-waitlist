const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'waitlist.json');
const PORT = process.env.PORT || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readList() {
  try {
    const list = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveList(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

const server = http.createServer(function (req, res) {
  const url = (req.url || '/').split('?')[0];

  // ---- API: receive waitlist signup ----
  if (req.method === 'POST' && url === '/api/waitlist') {
    let body = '';
    req.on('data', function (c) {
      body += c;
      if (body.length > 10000) { req.destroy(); }
    });
    req.on('end', function () {
      try {
        const d = JSON.parse(body || '{}');
        const email = String(d.email || '').trim().toLowerCase();
        const store = String(d.store || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return sendJSON(res, 400, { ok: false, error: 'Invalid email' });
        }
        if (!store) {
          return sendJSON(res, 400, { ok: false, error: 'Store URL required' });
        }
        const list = readList();
        const existing = list.find(function (x) { return x.email === email; });
        let count;
        if (existing) {
          existing.store = store || existing.store;
          existing.lastSignup = new Date().toISOString();
          count = list.length;
        } else {
          list.push({
            email: email,
            store: store,
            source: String(d.source || 'landing'),
            ip: req.socket.remoteAddress || '',
            signedUpAt: new Date().toISOString()
          });
          count = list.length;
        }
        saveList(list);
        sendJSON(res, 200, { ok: true, count: count, duplicate: !!existing });
      } catch (err) {
        sendJSON(res, 400, { ok: false, error: 'Bad request' });
      }
    });
    return;
  }

  // ---- API: view signups (for you) ----
  if (req.method === 'GET' && url === '/api/waitlist') {
    const list = readList();
    return sendJSON(res, 200, {
      ok: true,
      count: list.length,
      signups: list.map(function (x) {
        return { email: x.email, store: x.store, source: x.source, signedUpAt: x.signedUpAt };
      })
    });
  }

  // ---- static files ----
  let file = url === '/' ? '/index.html' : url;
  file = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
  const fp = path.join(ROOT, file);
  if (!fp.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }
  fs.readFile(fp, function (err, buf) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('AIM landing server running at http://localhost:' + PORT);
});
