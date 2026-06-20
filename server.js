const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    let db = {};
    try { if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch(e) {}
    res.json({
        users: db.users?.length || 0,
        claims: db.faucet?.claims || 0,
        schedules: db.schedules?.length || 0,
        earned: db.faucet?.earned || 0
    });
});

// ===== BOT INTEGRASI =====
if (process.env.NODE_ENV !== 'test') {
    try {
        console.log('🤖 Starting Faucet Bot Ultimate...');
        const bot = require('./faucet-bot-ultimate');
        bot.runAll().catch(err => console.log('⚠️ Bot error:', err.message));
        setInterval(() => { bot.runAll().catch(err => console.log('⚠️ Bot interval error:', err.message)); }, (bot.CONFIG?.interval || 300) * 1000);
        console.log('✅ Faucet Bot Ultimate started');
    } catch(err) { console.log('⚠️ Bot not loaded:', err.message); }
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 http://localhost:${PORT}`);
});

module.exports = app;
