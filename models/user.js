const pool = require('../database_connection');

const User = {
    register: function(email, username, password){
        const query = `INSERT INTO users (email, username, password) VALUES ($1, $2, $3)`;
        return pool.query(query, [email, username, password]);
    },

    verify: function(email){
        const query = `SELECT * FROM users WHERE email=$1`;
        return pool.query(query, [email]);
    },

    getUsername: function(id){
        const query = `SELECT username FROM users WHERE id=$1`;
        return pool.query(query, [id])
    },

    updateUser: function(id, username, pfp){
        const query = `UPDATE users SET username = $2, pfp = $3 WHERE id = $1`;
        return pool.query(query, [id, username, pfp]);
    },

    updatepfp: function(id, pfp){
        const query = `UPDATE users SET pfp = $2 WHERE id = $1`
        return pool.query(query, [id, pfp]);
    },

    getDetails: function(id){
        const query = `SELECT * FROM users WHERE id = $1`;
        return pool.query(query, [id]);
    },

    deleteUser: function(id){
        const query = `DELETE FROM users WHERE id = $1`;
        return pool.query(query, [id])
    }
}

module.exports = User;