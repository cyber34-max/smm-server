const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DB_PATH = path.join(__dirname, '../../data/database.json');

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { faucet: { claims: 0, earned: 0, history: [] } };
}

function saveDB(data) {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {}
}

const FAUCETS = [
    { name: 'FaucetPay', url: 'https://faucetpay.io/api/v1/claim', coin: 'BTC' },
    { name: 'ClaimFreeCoins', url: 'https://claimfreecoins.io/api/claim', coin: 'BTC' },
    { name: 'Beefaucet', url: 'https://beefaucet.org/api/claim', coin: 'BTC' },
    { name: 'FireFaucet', url: 'https://firefaucet.win/api/claim', coin: 'BTC' },
    { name: 'Cointiply', url: 'https://cointiply.com/api/claim', coin: 'BTC' },
    { name: 'FreeBitcoin', url: 'https://freebitco.in/api/claim', coin: 'BTC' },
    { name: 'BonusBitcoin', url: 'https://bonusbitcoin.co/api/claim', coin: 'BTC' },
    { name: 'Bitcoinker', url: 'https://bitcoinker.com/api/claim', coin: 'BTC' },
    { name: 'AllCoins', url: 'https://allcoins.io/api/claim', coin: 'BTC' },
    { name: 'FaucetCrypto', url: 'https://faucetcrypto.com/api/claim', coin: 'BTC' },
];

function getRandomUA() {
    const list = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Firefox/121.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36'
    ];
    return list[Math.floor(Math.random() * list.length)];
}

function getRandomDelay() {
    return Math.floor(Math.random() * 4000 + 2000);
}

function getRandomIP() {
    return '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
}

async function claimAllFaucets(wallet) {
    const results = [];
    let totalEarned = 0;
    let successCount = 0;

    for (const faucet of FAUCETS) {
        try {
            await new Promise(r => setTimeout(r, getRandomDelay()));

            const res = await axios.post(faucet.url, {
                wallet: wallet,
                currency: faucet.coin
            }, {
                headers: {
                    'User-Agent': getRandomUA(),
                    'Content-Type': 'application/json',
                    'X-Forwarded-For': getRandomIP()
                },
                timeout: 15000
            });

            const data = res.data;
            const ok = data.success === true || data.status === 'success' || data.claimed === true;
            const amount = parseFloat(data.amount || data.bonus || data.reward || 0);

            if (ok && amount > 0) {
                successCount++;
                totalEarned += amount;
                results.push({ faucet: faucet.name, coin: faucet.coin, amount, success: true });
            } else {
                results.push({ faucet: faucet.name, coin: faucet.coin, success: false, error: data.message || 'Gagal' });
            }
        } catch (err) {
            results.push({ faucet: faucet.name, coin: faucet.coin, success: false, error: err.message });
        }
    }

    return { total: results.length, success: successCount, failed: results.length - successCount, earned: totalEarned, results };
}

router.post('/claim', async (req, res) => {
    try {
        const { wallet, currency } = req.body;
        const db = loadDB();

        if (!wallet) return res.status(400).json({ error: 'Wallet wajib' });

        const lastClaim = db.faucet?.lastClaim;
        if (lastClaim && Date.now() - lastClaim < 30000) {
            return res.status(429).json({ error: 'Cooldown 30 detik', wait: Math.ceil((30000 - (Date.now() - lastClaim)) / 1000) });
        }

        const result = await claimAllFaucets(wallet);

        if (!db.faucet) db.faucet = { claims: 0, earned: 0, history: [], lastClaim: null };
        db.faucet.claims += result.total;
        db.faucet.earned += result.earned;
        db.faucet.history.push({
            id: Date.now().toString(),
            wallet,
            currency: currency || 'BTC',
            timestamp: new Date().toISOString(),
            result: result
        });
        db.faucet.lastClaim = Date.now();

        if (db.faucet.history.length > 200) db.faucet.history = db.faucet.history.slice(-200);
        saveDB(db);

        res.json({
            success: result.success > 0,
            claim: { amount: result.earned, currency: currency || 'BTC' },
            stats: { totalClaims: db.faucet.claims, totalEarned: db.faucet.earned },
            details: result
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', (req, res) => {
    const db = loadDB();
    res.json({
        claims: db.faucet?.claims || 0,
        earned: db.faucet?.earned || 0,
        history: db.faucet?.history?.slice(-20) || []
    });
});

module.exports = router;
