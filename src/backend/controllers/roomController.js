// ========================
// Room Controller - CRUD (sql.js)
// ========================
const { getDb, saveDb } = require('../config/database');
const path = require('path');
const fs = require('fs');

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

function parseRoom(r) {
    return {
        ...r,
        fotos: safeJsonParse(r.fotos, []),
        caracteristicas: safeJsonParse(r.caracteristicas, []),
        disponible: !!r.disponible,
        mascotas: !!r.mascotas,
        wifi: !!r.wifi,
        empadronamiento: !!r.empadronamiento,
        amueblada: !!r.amueblada
    };
}

// ---- List Rooms ----
exports.listRooms = async (req, res) => {
    try {
        const db = await getDb();
        const { q, precio, tipo, opcion, sort } = req.query;

        let sql = `
            SELECT r.*, u.nombre as owner_nombre, u.apellidos as owner_apellidos,
                   u.email as owner_email, u.telefono as owner_telefono
            FROM rooms r
            JOIN users u ON r.owner_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (q) {
            sql += ` AND (r.titulo LIKE ? OR r.zona LIKE ? OR r.direccion LIKE ? OR r.descripcion LIKE ?)`;
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (precio && !isNaN(precio)) {
            sql += ` AND r.precio <= ?`;
            params.push(parseFloat(precio));
        }
        if (tipo) {
            sql += ` AND r.tipo = ?`;
            params.push(tipo);
        }
        if (opcion) {
            switch (opcion) {
                case 'wifi': sql += ` AND r.wifi = 1`; break;
                case 'mascotas': sql += ` AND r.mascotas = 1`; break;
                case 'empadronamiento': sql += ` AND r.empadronamiento = 1`; break;
                case 'amueblada': sql += ` AND r.amueblada = 1`; break;
            }
        }

        switch (sort) {
            case 'precio-asc': sql += ` ORDER BY r.precio ASC`; break;
            case 'precio-desc': sql += ` ORDER BY r.precio DESC`; break;
            case 'reciente': sql += ` ORDER BY r.created_at DESC`; break;
            default: sql += ` ORDER BY r.disponible DESC, r.created_at DESC`; break;
        }

        const result = db.exec(sql, params);
        const rooms = resultToObjects(result).map(parseRoom);

        res.json({ rooms, total: rooms.length });

    } catch (err) {
        console.error('Error listing rooms:', err);
        res.status(500).json({ error: 'Error al obtener habitaciones.' });
    }
};

// ---- Get Single Room ----
exports.getRoom = async (req, res) => {
    try {
        const db = await getDb();
        const result = db.exec(`
            SELECT r.*, u.nombre as owner_nombre, u.apellidos as owner_apellidos,
                   u.email as owner_email, u.telefono as owner_telefono
            FROM rooms r
            JOIN users u ON r.owner_id = u.id
            WHERE r.id = ?
        `, [parseInt(req.params.id)]);

        const rooms = resultToObjects(result);
        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Habitación no encontrada.' });
        }

        res.json({ room: parseRoom(rooms[0]) });

    } catch (err) {
        console.error('Error getting room:', err);
        res.status(500).json({ error: 'Error al obtener la habitación.' });
    }
};

// ---- Create Room ----
exports.createRoom = async (req, res) => {
    try {
        const db = await getDb();
        const {
            titulo, direccion, zona, precio, tipo, descripcion,
            habitaciones_totales, habitaciones_libres,
            mascotas, wifi, empadronamiento, amueblada,
            lat, lng, caracteristicas, reglas
        } = req.body;

        if (!titulo || !direccion || !zona || !precio || !tipo) {
            return res.status(400).json({ error: 'Título, dirección, zona, precio y tipo son obligatorios.' });
        }
        if (!['individual', 'compartida', 'estudio'].includes(tipo)) {
            return res.status(400).json({ error: 'Tipo de habitación inválido.' });
        }

        db.run(`INSERT INTO rooms (owner_id, titulo, direccion, zona, precio, tipo, descripcion,
            habitaciones_totales, habitaciones_libres, mascotas, wifi, empadronamiento, amueblada,
            lat, lng, fotos, caracteristicas, reglas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, titulo, direccion, zona,
                parseFloat(precio), tipo, descripcion || '',
                parseInt(habitaciones_totales) || 1,
                parseInt(habitaciones_libres) || 1,
                mascotas ? 1 : 0,
                wifi !== false ? 1 : 0,
                empadronamiento ? 1 : 0,
                amueblada !== false ? 1 : 0,
                parseFloat(lat) || 0,
                parseFloat(lng) || 0,
                JSON.stringify([]),
                JSON.stringify(caracteristicas || []),
                reglas || ''
            ]);

        saveDb();

        const idResult = db.exec('SELECT last_insert_rowid() as id');
        const newId = idResult[0].values[0][0];

        const newResult = db.exec('SELECT * FROM rooms WHERE id = ?', [newId]);
        const newRoom = resultToObjects(newResult).map(parseRoom)[0];

        res.status(201).json({ message: '¡Habitación publicada con éxito!', room: newRoom });

    } catch (err) {
        console.error('Error creating room:', err);
        res.status(500).json({ error: 'Error al crear la habitación.' });
    }
};

// ---- Update Room ----
exports.updateRoom = async (req, res) => {
    try {
        const db = await getDb();
        const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [parseInt(req.params.id)]);
        const rooms = resultToObjects(roomResult);

        if (rooms.length === 0) return res.status(404).json({ error: 'Habitación no encontrada.' });
        if (rooms[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Sin permiso.' });

        const room = rooms[0];
        const {
            titulo, direccion, zona, precio, tipo, descripcion, disponible,
            habitaciones_totales, habitaciones_libres,
            mascotas, wifi, empadronamiento, amueblada,
            lat, lng, caracteristicas, reglas
        } = req.body;

        db.run(`UPDATE rooms SET
            titulo = ?, direccion = ?, zona = ?, precio = ?, tipo = ?,
            descripcion = ?, disponible = ?, habitaciones_totales = ?, habitaciones_libres = ?,
            mascotas = ?, wifi = ?, empadronamiento = ?, amueblada = ?,
            lat = ?, lng = ?, caracteristicas = ?, reglas = ?
            WHERE id = ?`,
            [
                titulo || room.titulo,
                direccion || room.direccion,
                zona || room.zona,
                precio != null ? parseFloat(precio) : room.precio,
                tipo || room.tipo,
                descripcion != null ? descripcion : room.descripcion,
                disponible != null ? (disponible ? 1 : 0) : room.disponible,
                habitaciones_totales != null ? parseInt(habitaciones_totales) : room.habitaciones_totales,
                habitaciones_libres != null ? parseInt(habitaciones_libres) : room.habitaciones_libres,
                mascotas != null ? (mascotas ? 1 : 0) : room.mascotas,
                wifi != null ? (wifi ? 1 : 0) : room.wifi,
                empadronamiento != null ? (empadronamiento ? 1 : 0) : room.empadronamiento,
                amueblada != null ? (amueblada ? 1 : 0) : room.amueblada,
                lat != null ? parseFloat(lat) : room.lat,
                lng != null ? parseFloat(lng) : room.lng,
                caracteristicas ? JSON.stringify(caracteristicas) : room.caracteristicas,
                reglas != null ? reglas : room.reglas,
                parseInt(req.params.id)
            ]);

        saveDb();

        const updatedResult = db.exec('SELECT * FROM rooms WHERE id = ?', [parseInt(req.params.id)]);
        const updated = resultToObjects(updatedResult).map(parseRoom)[0];

        res.json({ message: 'Habitación actualizada.', room: updated });

    } catch (err) {
        console.error('Error updating room:', err);
        res.status(500).json({ error: 'Error al actualizar la habitación.' });
    }
};

// ---- Delete Room ----
exports.deleteRoom = async (req, res) => {
    try {
        const db = await getDb();
        const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [parseInt(req.params.id)]);
        const rooms = resultToObjects(roomResult);

        if (rooms.length === 0) return res.status(404).json({ error: 'Habitación no encontrada.' });
        if (rooms[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Sin permiso.' });

        // Delete photos from filesystem
        const fotos = safeJsonParse(rooms[0].fotos, []);
        fotos.forEach(foto => {
            const filePath = path.join(__dirname, '..', foto);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        db.run('DELETE FROM rooms WHERE id = ?', [parseInt(req.params.id)]);
        saveDb();

        res.json({ message: 'Habitación eliminada correctamente.' });

    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ error: 'Error al eliminar la habitación.' });
    }
};

// ---- Upload Photos ----
exports.uploadPhotos = async (req, res) => {
    try {
        const db = await getDb();
        const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [parseInt(req.params.id)]);
        const rooms = resultToObjects(roomResult);

        if (rooms.length === 0) return res.status(404).json({ error: 'Habitación no encontrada.' });
        if (rooms[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Sin permiso.' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se han proporcionado imágenes.' });
        }

        const currentFotos = safeJsonParse(rooms[0].fotos, []);
        const newFotos = req.files.map(f => `/uploads/${f.filename}`);
        const allFotos = [...currentFotos, ...newFotos].slice(0, 8);

        db.run('UPDATE rooms SET fotos = ? WHERE id = ?', [JSON.stringify(allFotos), parseInt(req.params.id)]);
        saveDb();

        res.json({ message: 'Fotos subidas correctamente.', fotos: allFotos });

    } catch (err) {
        console.error('Error uploading photos:', err);
        res.status(500).json({ error: 'Error al subir las fotos.' });
    }
};

// ---- Get My Rooms ----
exports.getMyRooms = async (req, res) => {
    try {
        const db = await getDb();
        const result = db.exec('SELECT * FROM rooms WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]);
        const rooms = resultToObjects(result).map(parseRoom);

        res.json({ rooms });

    } catch (err) {
        console.error('Error getting my rooms:', err);
        res.status(500).json({ error: 'Error al obtener tus habitaciones.' });
    }
};

// ---- Contact Room ----
exports.contactRoom = async (req, res) => {
    try {
        const db = await getDb();
        const { tipo, mensaje } = req.body;
        const room_id = parseInt(req.params.id);

        const roomResult = db.exec('SELECT * FROM rooms WHERE id = ?', [room_id]);
        if (resultToObjects(roomResult).length === 0) {
            return res.status(404).json({ error: 'Habitación no encontrada.' });
        }

        db.run(`INSERT INTO contacts (room_id, user_id, tipo, mensaje) VALUES (?, ?, ?, ?)`,
            [room_id, req.user.id, tipo || 'contacto', mensaje || '']);
        saveDb();

        res.status(201).json({
            message: tipo === 'visita' ? 'Solicitud de visita enviada.' : 'Solicitud de contacto enviada.'
        });

    } catch (err) {
        console.error('Error contacting room:', err);
        res.status(500).json({ error: 'Error al enviar la solicitud.' });
    }
};

// ---- Util ----
function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
}
