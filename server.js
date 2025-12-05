const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const port = process.env.PORT || 8444;

const dbConfig = {
  host: process.env.DB_HOST || 'mariadb',
  user: process.env.DB_USER || 'kidcoach',
  password: process.env.DB_PASSWORD || 'kidsecret',
  database: process.env.DB_DATABASE || 'kids',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
};

const adminKey = process.env.ADMIN_KEY || 'admin123';

let pool;

async function initDb() {
  pool = await mysql.createPool({
    ...dbConfig,
    connectionLimit: 10
  });

  await pool.query(`CREATE TABLE IF NOT EXISTS child_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_name VARCHAR(100) NOT NULL,
    child_token VARCHAR(128) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(
    'ALTER TABLE child_progress ADD COLUMN IF NOT EXISTS child_token VARCHAR(128) NOT NULL DEFAULT ""'
  );

  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_child_token ON child_progress (child_name, child_token)'
  );
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/progress', async (req, res) => {
  const { childName, childToken, activity, score, details } = req.body;

  if (!childName || !childToken || !activity || typeof score !== 'number') {
    return res.status(400).json({ error: 'childName, childToken, activity en score zijn verplicht.' });
  }

  try {
    await pool.query(
      'INSERT INTO child_progress (child_name, child_token, activity, score, details) VALUES (?, ?, ?, ?, ?)',
      [childName, childToken, activity, score, JSON.stringify(details || {})]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Fout bij opslaan van progressie', error);
    res.status(500).json({ error: 'Kon progressie niet opslaan' });
  }
});

app.get('/api/admin/progress', async (req, res) => {
  if (req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'Admin sleutel ongeldig' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT child_name AS childName, activity, score, details, created_at AS createdAt
       FROM child_progress
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fout bij ophalen van progressies', error);
    res.status(500).json({ error: 'Kon progressies niet ophalen' });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: dbConfig.host });
  } catch (error) {
    console.error('Healthcheck failure', error);
    res.status(503).json({ ok: false, error: 'database not reachable' });
  }
});

app.get('/api/children/:name', async (req, res) => {
  const token = req.headers['x-child-token'];

  if (!token) {
    return res.status(401).json({ error: 'child token ontbreekt' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT activity, score, details, created_at AS createdAt
       FROM child_progress
       WHERE child_name = ? AND child_token = ?
       ORDER BY created_at DESC`,
      [req.params.name, token]
    );
    res.json(rows);
  } catch (error) {
    console.error('Fout bij ophalen van kindprogressie', error);
    res.status(500).json({ error: 'Kon progressie niet ophalen' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Kleuter digibord draait op poort ${port}`);
    });
  })
  .catch((error) => {
    console.error('Kon database niet initialiseren', error);
    process.exit(1);
  });
