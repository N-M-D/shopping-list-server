const pool = require('../database_connection');

const Family = {

    verify: function(familyID, userID){
        const query = `SELECT * FROM "families-users" WHERE "familyID" = $1 AND "userID" = $2`;
        return pool.query(query, [familyID, userID]); 
    },
    create: function(name){
        const query = `INSERT INTO families (name) VALUES ($1) returning id`;
        return pool.query(query, [name]);
    },

    generateLink: function(familyID, key){
        const query = `INSERT INTO "familyInvite" ("familyID", key) VALUES ($1, $2) RETURNING key`;
        return pool.query(query, [familyID, key]);
    },

    getMembers: function(id){
        const query = `SELECT "userID" FROM "families-users" WHERE "familyID" = $1`;
        return pool.query(query, [id]);
    },

    getFamilies: function(id){
        const query = `SELECT * FROM "families-users" fu INNER JOIN families f ON fu."familyID" = f.id WHERE "userID" = $1`;
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

    deleteCode: function(familyID){
        const query = `DELETE FROM "familyInvite" WHERE "familyID" = $1`;
        return pool.query(query, [familyID]);
    },

    leave: function(familyID, userID){
        const query = `DELETE FROM "families-users" WHERE familyID = $1 AND userID = $2`;
        return pool.query(query, [familyID, userID]);
    }
}

module.exports = Family;