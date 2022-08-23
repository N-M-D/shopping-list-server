require('dotenv').config();
const pg = require('pg');
const Pool = pg.Pool;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})

module.exports = pool;