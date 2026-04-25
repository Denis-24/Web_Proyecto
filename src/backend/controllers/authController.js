// ========================
// Auth Controller (sql.js)
// ========================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../config/database');

// Helper: convert sql.js result to object array
function resultToObjects(result) {
    if (!result || result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

// ---- Register ----
exports.register = async (req, res) => {
    try {
        const { nombre, apellidos, email, telefono, password, tipo } = req.body;

        if (!nombre || !apellidos || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
        }
        if (!['inquilino', 'arrendador'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de usuario inválido.' });
        }

        const db = await getDb();

        const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0 && existing[0].values.length > 0) {
            return res.status(409).json({ error: 'Este email ya está registrado.' });
        }

        const password_hash = bcrypt.hashSync(password, 10);

        db.run(`INSERT INTO users (nombre, apellidos, email, telefono, password_hash, tipo)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellidos, email, telefono || '', password_hash, tipo]);

        saveDb();

        // Get the inserted user id
        const idResult = db.exec('SELECT last_insert_rowid() as id');
        const id = idResult[0].values[0][0];

        const user = { id, nombre, apellidos, email, telefono: telefono || '', tipo };

        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({ message: '¡Cuenta creada con éxito!', token, user });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ---- Login ----
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }

        const db = await getDb();
        const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
        const users = resultToObjects(result);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
        }

        const user = users[0];
        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password_hash, ...userWithoutPassword } = user;

        res.json({ message: '¡Sesión iniciada correctamente!', token, user: userWithoutPassword });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ---- Get Current User ----
exports.getMe = async (req, res) => {
    try {
        const db = await getDb();
        const result = db.exec(
            'SELECT id, nombre, apellidos, email, telefono, tipo, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        const users = resultToObjects(result);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ user: users[0] });
    } catch (err) {
        console.error('Error en getMe:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
