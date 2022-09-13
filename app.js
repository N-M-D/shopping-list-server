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

const isLoggedInMiddleWare = require('./isLoggedInMiddleware');
const Family = require('./models/family');
const { nanoid } = require('nanoid');

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

app.get('/user/username', isLoggedInMiddleWare, function(req, res){
    const id = req.decodedToken.user_id;
    User.getUsername(id)
    .then((response) => {
        return res.status(200).send(response);
    })
})

app.get('/user/:id', function(req, res){
    const id = req.params.id;
    User.getUsername(id)
    .then((response) => {
        return res.status(200).send(response);
    })
})

app.put('/user/update', [upload.single('pfp'), isLoggedInMiddleWare], async (req, res) => {
    const id = req.decodedToken.user_id;
    console.log("ID:",id);
    const file = req.file;
    const body = req.body;
    console.log("Body:", body);
    const email = body.email;
    const username = body.username
    await uploadFile(file)
    .then((response) => {
        let location = response.Location;
        User.updateUser(id, username, location)
        .then((result) => {
            if(result.rowCount > 0){
                return res.status(200).send();
            }else{
                return res.status(404).send();
            }
            
        })
    });
})

app.post('/user/details', isLoggedInMiddleWare, (req, res) => {
    const id = req.decodedToken.user_id;
    User.getDetails(id)
    .then((response) => {
        return res.status(200).send(response);
    })
})

app.post('/family', isLoggedInMiddleWare, (req, res) => {
    const userID = req.decodedToken.user_id;
    const body = req.body;
    let name = req.body.name;
    console.log("Body: ", body);
    if(name == null){
        name = "My family";
    }
    Family.create(name)
    .then((result) => {
        const rowCount = result.rowCount;
        if(rowCount > 0){
            const familyID = result.rows[0].id;
            console.log("FamilyID ", familyID);
            Family.addMember(familyID, userID)
            .then((response) => {
                if(response.rowCount > 0){
                    return res.status(200).send(response);
                }
                throw "Failed in inserting user into family";
            })
        }else{
            throw "Failed in creating family";
        }
    })
    .catch((error) => {
        console.log(error);
        res.status(400).send();
    })
})

app.get('/families', isLoggedInMiddleWare, (req, res) => {
    const id = req.decodedToken.user_id;
    Family.getFamilies(id)
    .then((result) => {
        return res.status(200).send(result);
    })
})

app.get('/family/:id', (req, res) => {
    const id = req.params.id;
    Family.getFamilyDetails(id)
    .then((response) => {
        console.log(response);
        res.status(200).send(response);
    })
    .catch((error) => {
        console.log(error);
        res.status(404).send(error);
    })
})

app.get('/family/:id/members', isLoggedInMiddleWare, (req, res) => {
    const userID = req.decodedToken.user_id;
    const familyID = req.params.id;
    Family.verify(familyID, userID)
    .then((response) => {
        if(response.rowCount > 0){
            Family.getMembers(familyID)
            .then((result) => {
                console.log(result)
                return res.status(200).send(result);
            })
        }else{
            return res.status(401).send();
        };
    })
})

app.post('/family/:id/link', isLoggedInMiddleWare, (req, res) => {
    const familyID = req.params.id;
    const userID = req.decodedToken.user_id;
    Family.verify(familyID, userID)
    .then((response) => {
        if(response.rowCount > 0){
            Family.deleteCode(familyID)
            .then(() => {
                const key = nanoid();
                Family.generateLink(familyID, key)
                .then((result) => {
                    res.status(200).send(result);
                })
            })
        }else{
            return res.status(401).send();
        };
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message });
})

//const PORT = process.env.PORT || 3000
const PORT = 8080
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
