// ========================
// Database Configuration (sql.js - pure JS SQLite)
// ========================
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'roomie.db');

let db = null;
let SQL = null;

async function initSql() {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    return SQL;
}

async function getDb() {
    if (db) return db;

    const SqlJs = await initSql();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SqlJs.Database(buffer);
    } else {
        db = new SqlJs.Database();
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

// Save periodically and on exit
setInterval(saveDb, 10000); // Save every 10 seconds
process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });
process.on('SIGTERM', () => { saveDb(); process.exit(); });

module.exports = { getDb, saveDb };
