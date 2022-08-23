require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "jwt-secret-key-do-not-share";
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 3000

const User = require ('./models/user')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const isLoggedInMiddleWare = require('./isLoggedInMiddleware')

app.use(cors());

app.post('/register', function(req, res){
    const body = req.body;
    const email = body.email;
    const username = body.username;
    const password = user.password;
    bcrypt.genSalt(saltRounds, function(err, salt){
        bcrypt.hash(password, salt, function(err, hash){
            User.register(email, username, hash)
            .then((response) => {
                console.log(response);
                return res.status(201).send();
            })
            .catch((error) => {
                return res.status(400).send();
            })
        })
    })
})

app.post('/login', function(req, res){
    const body = req.body;
    const email = body.email;
    const password = body.password;
    User.verify(email)
    .then((response) => {
        if(response.rows.length === 0){
            return res.status(404).send();
        }
        const user = response.rows[0];
        const hash = user.role;
        bcrypt.compare(password, hash, (err, result) => {
            if(result){
                const payload = {
                    user_id: user.id
                }
                jwt.sign(payload, JWT_SECRET, { algorithm: "HS256"}, (error, token) => {
                    if(error){
                        console.log("Error in signing: ", error);
                        return res.status(400).send();
                    }
                    return res.status(200).send({
                        token: token
                    });
                })
            } else {
                return res.status(401).send();
            }
        })
    })
    .catch((error) => {
        console.log(error);
        return res.status(400).send(error);
    })
})