// ========================
// ROOMIE — Express Server
// ========================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initializeDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Ensure uploads directory exists ----
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Static files ----
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(uploadsDir));

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// ---- Health check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Roomie API running 🚀', timestamp: new Date().toISOString() });
});

// ---- SPA fallback ----
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Ruta no encontrada.' });
    }
    const htmlFile = path.join(__dirname, '..', 'frontend', req.path);
    if (fs.existsSync(htmlFile)) {
        res.sendFile(htmlFile);
    } else {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    }
});

// ---- Error handling ----
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    if (err.name === 'MulterError') {
        return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
});

// ---- Initialize Database & Start Server ----
async function start() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║   🏠 ROOMIE Server Running               ║
    ║                                          ║
    ║   🌐 http://localhost:${PORT}              ║
    ║   📡 API: http://localhost:${PORT}/api     ║
    ║                                          ║
    ║   Demo users:                            ║
    ║   📧 carlos@roomie.com (arrendador)      ║
    ║   📧 maria@roomie.com  (inquilino)       ║
    ║   🔑 password123                         ║
    ║                                          ║
    ╚══════════════════════════════════════════╝
            `);
        });
    } catch (err) {
        console.error('❌ Error al iniciar el servidor:', err);
        process.exit(1);
    }
}

start();
