// ========================
// Database Models & Schema Initialization (sql.js)
// ========================
const { getDb, saveDb } = require('../config/database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
    const db = await getDb();

    // ---- Users Table ----
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellidos TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefono TEXT DEFAULT '',
            password_hash TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('inquilino', 'arrendador')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ---- Rooms Table ----
    db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            direccion TEXT NOT NULL,
            zona TEXT NOT NULL,
            precio REAL NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('individual', 'compartida', 'estudio')),
            descripcion TEXT DEFAULT '',
            disponible INTEGER DEFAULT 1,
            habitaciones_totales INTEGER DEFAULT 1,
            habitaciones_libres INTEGER DEFAULT 1,
            mascotas INTEGER DEFAULT 0,
            wifi INTEGER DEFAULT 1,
            empadronamiento INTEGER DEFAULT 0,
            amueblada INTEGER DEFAULT 1,
            lat REAL DEFAULT 0,
            lng REAL DEFAULT 0,
            fotos TEXT DEFAULT '[]',
            caracteristicas TEXT DEFAULT '[]',
            reglas TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ---- Contacts Table ----
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('contacto', 'visita')),
            mensaje TEXT DEFAULT '',
            estado TEXT DEFAULT 'pendiente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // ---- Seed if empty ----
    const result = db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = result.length > 0 ? result[0].values[0][0] : 0;

    if (userCount === 0) {
        await seedData(db);
    }

    saveDb();
    console.log('✅ Base de datos inicializada correctamente');
}

async function seedData(db) {
    const hashedPassword = bcrypt.hashSync('password123', 10);

    // Demo users
    db.run(`INSERT INTO users (nombre, apellidos, email, telefono, password_hash, tipo)
            VALUES (?, ?, ?, ?, ?, ?)`,
        ['Carlos', 'García López', 'carlos@roomie.com', '+34 600 111 222', hashedPassword, 'arrendador']);

    db.run(`INSERT INTO users (nombre, apellidos, email, telefono, password_hash, tipo)
            VALUES (?, ?, ?, ?, ?, ?)`,
        ['María', 'González Ruiz', 'maria@roomie.com', '+34 600 333 444', hashedPassword, 'inquilino']);

    db.run(`INSERT INTO users (nombre, apellidos, email, telefono, password_hash, tipo)
            VALUES (?, ?, ?, ?, ?, ?)`,
        ['Juan', 'Pérez Martín', 'juan@roomie.com', '+34 600 555 666', hashedPassword, 'arrendador']);

    // Demo rooms with REAL coordinates
    const rooms = [
        [1, 'Habitación individual luminosa', 'Calle Mayor 14, Madrid', 'Centro · Madrid', 450, 'individual',
            'Habitación luminosa en piso compartido con 4 habitaciones. Cocina equipada, dos baños y salón con terraza.',
            1, 4, 2, 0, 1, 1, 1, 40.4168, -3.7038,
            '[]', '["Cama 90cm","12m²","Ventana exterior","Armario empotrado"]',
            'No se permiten mascotas. Silencio después de las 23h.'],

        [1, 'Habitación doble en piso universitario', 'Av. Complutense 5, Madrid', 'Ciudad Universitaria · Madrid', 380, 'compartida',
            'Piso en zona universitaria ideal para estudiantes. Muy bien comunicado con la facultad de Medicina.',
            1, 6, 3, 1, 1, 0, 1, 40.4488, -3.7276,
            '[]', '["Cama 90cm","15m²","Escritorio","Estantería"]',
            'Mascotas pequeñas permitidas. Ambiente tranquilo de estudio.'],

        [3, 'Estudio privado reformado', 'C/ Balmes 88, Barcelona', 'Gràcia · Barcelona', 695, 'estudio',
            'Estudio completamente independiente, totalmente reformado y amueblado. Ideal para profesional o postgrado.',
            1, 1, 1, 0, 1, 1, 1, 41.3954, 2.1532,
            '[]', '["Cama 150cm","30m²","Baño privado","Kitchenette","AC"]',
            'No se permiten mascotas ni fiestas.'],

        [1, 'Habitación en piso nuevo', 'C/ Colón 22, Valencia', 'Eixample · Valencia', 320, 'individual',
            'Piso reformado de 3 habitaciones en el centro de Valencia. A 10 minutos a pie de la UV.',
            1, 3, 1, 0, 1, 1, 1, 39.4699, -0.3763,
            '[]', '["Cama 105cm","10m²","Armario","Ventana patio"]',
            'No se permiten fiestas. Convivencia respetuosa.'],

        [3, 'Habitación amueblada zona universitaria', 'Av. de Andalucía 14, Sevilla', 'Los Remedios · Sevilla', 290, 'individual',
            'Habitación en piso de 5 estudiantes muy bien comunicado. Ambiente dinámico y sociable.',
            1, 5, 2, 1, 1, 0, 1, 37.3891, -5.9845,
            '[]', '["Cama 90cm","9m²","Armario","Escritorio"]',
            'Mascotas pequeñas permitidas. Se permiten visitas con previo aviso.'],

        [1, 'Piso compartido zona Alameda', 'C/ Feria 33, Sevilla', 'Alameda · Sevilla', 330, 'compartida',
            'Piso céntrico con terraza. Actualmente sin disponibilidad.',
            0, 4, 0, 0, 1, 1, 1, 37.3946, -5.9915,
            '[]', '["Cama 90cm","11m²","Armario","Terraza compartida"]',
            'No mascotas. No fumar en el interior.'],

        [3, 'Habitación grande con baño privado', 'C/ la Palma 8, Bilbao', 'Casco Viejo · Bilbao', 520, 'individual',
            'Habitación premium con baño privado en piso de diseño en el casco viejo de Bilbao.',
            1, 3, 1, 0, 1, 1, 1, 43.2569, -2.9244,
            '[]', '["Cama 135cm","20m²","Baño en suite","Escritorio","AC"]',
            'No mascotas. No ruido después de las 22h.'],

        [1, 'Habitación económica estudiantes', 'C/ San Fernando 45, Granada', 'Centro · Granada', 250, 'compartida',
            'La opción más económica de Granada. Piso de estudiantes muy cerca de la UGR.',
            1, 6, 4, 0, 1, 0, 1, 37.1773, -3.5986,
            '[]', '["Cama 90cm","8m²","Armario","Luz natural"]',
            'Exclusivo para estudiantes. Comunidad responsable.']
    ];

    for (const r of rooms) {
        db.run(`INSERT INTO rooms (owner_id, titulo, direccion, zona, precio, tipo, descripcion,
            disponible, habitaciones_totales, habitaciones_libres, mascotas, wifi, empadronamiento, amueblada,
            lat, lng, fotos, caracteristicas, reglas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, r);
    }

    saveDb();
    console.log('🌱 Datos de ejemplo insertados (3 usuarios + 8 habitaciones)');
}

module.exports = { initializeDatabase };
