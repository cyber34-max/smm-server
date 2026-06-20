const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ===== DATABASE =====
const DB_PATH = path.join(__dirname, 'data', 'database.json');

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { 
        users: [], 
        schedules: [], 
        faucet: { claims: 0, earned: 0, history: [] },
        products: [],
        campaigns: [],
        bypass: { attempts: 0, success: 0, history: [] }
    };
}

function saveDB(data) {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {}
}

// ===== ROUTES =====
const authRoutes = require('./src/routes/auth');
const faucetRoutes = require('./src/routes/faucet');
const scheduleRoutes = require('./src/routes/schedule');
const bypassRoutes = require('./src/routes/bypass');
const shopRoutes = require('./src/routes/shop');
const marketingRoutes = require('./src/routes/marketing');
const analyticsRoutes = require('./src/routes/analytics');
const communityRoutes = require('./src/routes/community');

app.use('/api/auth', authRoutes);
app.use('/api/faucet', faucetRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/bypass', bypassRoutes);
app.use('/api/products', shopRoutes);
app.use('/api/campaigns', marketingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/community', communityRoutes);

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
    const db = loadDB();
    res.json({
        users: db.users?.length || 0,
        claims: db.faucet?.claims || 0,
        schedules: db.schedules?.length || 0,
        earned: db.faucet?.earned || 0
    });
});

// ===== ROOT =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// ===== ERROR =====
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 http://localhost:${PORT}`);
});

module.exports = app;
