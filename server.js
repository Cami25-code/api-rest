const http = require('http');
const db = require('./database');

const PORT = 8082;

// Initialise la table users
db.createTable('users');

function sendResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(JSON.parse(body || '{}')));
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log(`${method} ${url}`);

  // GET /users → liste tous les users
  if (method === 'GET' && url === '/users') {
    const users = db.selectAll('users');
    return sendResponse(res, 200, users);
  }

  // POST /users → crée un user
  if (method === 'POST' && url === '/users') {
    const body = await getBody(req);
    const user = db.insert('users', body);
    return sendResponse(res, 201, user);
  }

  // GET /users/:id → un seul user
  if (method === 'GET' && url.startsWith('/users/')) {
    const id = parseInt(url.split('/')[2]);
    const user = db.selectOne('users', id);
    if (!user) return sendResponse(res, 404, { error: 'User non trouvé' });
    return sendResponse(res, 200, user);
  }

  // PUT /users/:id → modifie un user
  if (method === 'PUT' && url.startsWith('/users/')) {
    const id = parseInt(url.split('/')[2]);
    const body = await getBody(req);
    const user = db.update('users', id, body);
    return sendResponse(res, 200, user);
  }

  // DELETE /users/:id → supprime un user
  if (method === 'DELETE' && url.startsWith('/users/')) {
    const id = parseInt(url.split('/')[2]);
    db.deleteRecord('users', id);
    return sendResponse(res, 200, { message: 'User supprimé' });
  }

  // Route inconnue
  sendResponse(res, 404, { error: 'Route non trouvée' });
});

server.listen(PORT, () => {
  console.log(`🚀 API REST démarrée sur http://localhost:${PORT}`);
  console.log(`
  GET    /users      → Liste tous les users
  POST   /users      → Crée un user
  GET    /users/:id  → Un seul user
  PUT    /users/:id  → Modifie un user
  DELETE /users/:id  → Supprime un user
  `);
});