const pool = require('../database_connection');

const User = {
    register: function(email, username, password){
        const query = `INSERT INTO users (email, username, password) VALUES ($1, $2, $3)`;
        return pool.query(query, [email, username, password]);
    },

    verify: function(email){
        const query = `SELECT * FROM users WHERE email=$1`;
        return pool.query(query, [email]);
    }
}

module.exports = User;