require('dotenv').config();
const express = require('express');
const db = require('./db');
const cookieParser = require('cookie-parser');
const path = require('path');
const { signSession, requireAuth } = require('./perimeter-guard');

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/api/v1/health', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'success', db_time: result.rows[0].now });
    } catch (err) {
        console.error('DB Connection Error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});


const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'mforce_utilities_ui/build/web'); 

app.get('/', (req, res) => { if (req.cookies.__session) return res.redirect('/app'); res.sendFile(path.join(__dirname, 'perimeter.html')); });
app.post('/sessionLogin', (req, res) => {
    const idToken = req.body.idToken;
    if (!idToken) return res.status(401).json({error: 'Unauthorized'});
    res.cookie('__session', signSession(idToken), { maxAge: 1000 * 60 * 60 * 24 * 5, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ status: 'success' });
});
app.get('/app', requireAuth, (req, res) => { res.sendFile(path.join(DIST_DIR, 'index.html')); });
app.use(express.static(DIST_DIR, { index: false }));
app.get('*', requireAuth, (req, res) => { res.sendFile(path.join(DIST_DIR, 'index.html')); });

app.listen(PORT, async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS configs (
                id SERIAL PRIMARY KEY, key VARCHAR(255) UNIQUE NOT NULL, value VARCHAR(255)
            );
        `);
        console.log('Database schema initialized for configs.');
    } catch (err) {
        console.error('Failed to initialize database schema:', err);
    }
    console.log(`mForce Perimeter active on port ${PORT}`);
});

app.get('/api/v1/configs', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM configs');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch configs' });
    }
});

app.post('/api/v1/configs', requireAuth, async (req, res) => {
    try {
        const { key, value } = req.body;
        const result = await db.query(
            'INSERT INTO configs (key, value) VALUES ($1, $2) RETURNING *',
            [key, value]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create configs' });
    }
});

app.put('/api/v1/configs/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { key, value } = req.body;
        const result = await db.query(
            'UPDATE configs SET key = COALESCE($1, key), value = COALESCE($2, value) WHERE id = $3 RETURNING *',
            [key, value, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update configs' });
    }
});

app.delete('/api/v1/configs/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM configs WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ status: 'success', deleted: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete configs' });
    }
});
