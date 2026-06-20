const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '../../data/database.json');
const JWT_SECRET = process.env.JWT_SECRET || 'smm_secret_2024';

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { users: [] };
}

function saveDB(data) {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {}
}

// ===== REGISTER =====
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const db = loadDB();

        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib' });
        }

        if (db.users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            email: email || '',
            createdAt: new Date().toISOString(),
            role: 'user'
        };

        db.users.push(user);
        saveDB(db);

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil!',
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = loadDB();

        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib' });
        }

        const user = db.users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login berhasil!',
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// ===== ME =====
router.get('/me', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const db = loadDB();
        const user = db.users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token tidak valid' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token kadaluarsa' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;
