const pool = require('../database_connection');

const Family = {
    create: function(name){
        const query = `INSERT INTO families (name) VALUES ($1) returning id`;
        return pool.query(query, [name]);
    },

    getMembers: function(id){
        const query = `SELECT userID FROM "families-users" WHERE familyID = $1`;
        return pool.query(query, [id]);
    },

    getFamilies: function(id){
        const query = `SELECT "familyID" FROM "families-users" WHERE "userID" = $1`;
        return pool.query(query, [id])
    },

    getFamilyDetails: function(id){
        const query = `SELECT * FROM families WHERE id = $1`;
        return pool.query(query, [id])
    },

    addMember: function(familyID, userID){
        const query = `INSERT INTO "families-users" ("familyID", "userID") VALUES ($1, $2)`;
        return pool.query(query, [familyID, userID]);
    },

    delete: function(familyID){
        const query = `DELETE FROM families WHERE id = $1`;
        return pool.query(query, [familyID]);
    },

    leave: function(familyID, userID){
        const query = `DELETE FROM "families-users" WHERE familyID = $1 AND userID = $2`;
        return pool.query(query, [familyID, userID]);
    }
}

module.exports = Family;