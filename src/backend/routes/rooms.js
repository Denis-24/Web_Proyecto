// ========================
// Room Routes
// ========================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const roomController = require('../controllers/roomController');
const { authMiddleware, arrendadorOnly } = require('../middleware/auth');

// Multer config for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `room-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'));
        }
    }
});

// Public routes
router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoom);

// Protected routes (require login)
router.post('/:id/contact', authMiddleware, roomController.contactRoom);

// Landlord-only routes
router.post('/', authMiddleware, arrendadorOnly, roomController.createRoom);
router.put('/:id', authMiddleware, arrendadorOnly, roomController.updateRoom);
router.delete('/:id', authMiddleware, arrendadorOnly, roomController.deleteRoom);
router.post('/:id/upload', authMiddleware, arrendadorOnly, upload.array('photos', 8), roomController.uploadPhotos);

// Get my rooms (landlord panel)
router.get('/user/my-rooms', authMiddleware, arrendadorOnly, roomController.getMyRooms);

module.exports = router;
