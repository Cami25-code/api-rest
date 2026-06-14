const fs = require('fs');
const DB_FILE = './data.json';

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ tables: {} }));
}

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function createTable(tableName) {
  const db = loadDB();
  if (!db.tables[tableName]) {
    db.tables[tableName] = [];
    saveDB(db);
  }
}

function insert(tableName, record) {
  const db = loadDB();
  record.id = Date.now();
  db.tables[tableName].push(record);
  saveDB(db);
  return record;
}

function selectAll(tableName) {
  const db = loadDB();
  return db.tables[tableName] || [];
}

function selectOne(tableName, id) {
  const db = loadDB();
  return db.tables[tableName].find(r => r.id === id);
}

function update(tableName, id, newData) {
  const db = loadDB();
  db.tables[tableName] = db.tables[tableName].map(r =>
    r.id === id ? { ...r, ...newData } : r
  );
  saveDB(db);
  return selectOne(tableName, id);
}

function deleteRecord(tableName, id) {
  const db = loadDB();
  db.tables[tableName] = db.tables[tableName].filter(r => r.id !== id);
  saveDB(db);
}

module.exports = { createTable, insert, selectAll, selectOne, update, deleteRecord };