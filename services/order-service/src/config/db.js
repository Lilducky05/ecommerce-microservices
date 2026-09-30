const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function query(text, params) {
    return pool.query(text, params);
}

async function testConnection() {
    await pool.query('SELECT 1');
    console.log('Order PostgreSQL connected');
}

module.exports = {
    query,
    testConnection
};