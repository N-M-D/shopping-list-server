require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "jwt-secret-key-do-not-share";
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = process.env.PORT || 3000

const User = require ('./models/user')
const { uploadFile } = require("./models/s3")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const isLoggedInMiddleWare = require('./isLoggedInMiddleware')

app.use(cors());

app.post('/register', upload.single('image'), function(req, res){
    const file = req.file;
    console.log(file);
    const body = req.body;
    const email = body.email;
    const username = body.username;
    const password = body.password;
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
        const hash = user.password;
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

app.put('/user/update', upload.single('pfp'), (req, res) => {
    //const id = req.decodedToken.user_id;
    const file = req.file;
    console.log(file);
    const body = req.body;
    console.log(body);
    res.status(200).send();

})

app.post('/user/details', isLoggedInMiddleWare, (req, res) => {
    const id = req.decodedToken.user_id;
    console.log(id);
    User.getDetails(id)
    .then((response) => {
        console.log(response);
        return res.status(200).send(response);
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message });
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
