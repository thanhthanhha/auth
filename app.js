require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcrypt');
const auth = require("./middleware/auth");
const story = require("./middleware/story");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(bodyParser.json()); // <--- Here
app.use(bodyParser.urlencoded({extended: true}));

//app user
const User = require("./model/user").User;

//Upload image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
const upload = multer({ storage: storage });

//main

app.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!(username && password && email)) {

            return res.status(400).send("All input is required");
        }

        //check user
        const OldUser = await User.findOne({$or: [{username},{email}]});
        
        if (OldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //encrypt
        encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptedPassword,
            timestamp_day: new Date(),
        })

        const token = jwt.sign(
            { user_id: user._id, username },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
        // save user token
        let obj = {...user._doc}
        obj.token = token;
        return res.status(201).json(obj);

    } catch (err) {
        console.log(err);
    }
        
}); 

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if(!(username && password)) {
            return res.status(400).send("All input is required");
        }

        const user = await User.findOne({username});

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, username },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "2h",
                }
              );
                let obj = {...user._doc}
                obj.token = token;
                return res.status(200).json(obj);
        }
        return res.status(400).send("Invalid Credentials");
    } catch(err) {
        console.log(err);
    }
});

//verify

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

app.get("/welcome", auth, (req, res) => {
    if (res.locals.authuser) { return res.status(200).json(res.locals.authuser);}
    return res.status(401).send("cool but not working");
  });

//get story

app.get('/story/:id', story.story);

app.get('/storylist', story.storylist);

app.get('/search', story.searchstory);

//get user

app.get('/user/:name', async (req, res) => {

    try {
        let username = {
            username: req.params.name
        }

        
        const user = await User.findOne(username).populate([{
            path: "work",
            model: "stories"
        }]);
    
        if(user) {
            return res.status(201).json(user);
        }

        throw 'Username not exist'
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
    
})

app.post('/user/:name/update', upload.single('avatar'), async(req, res) => {

    try {

        const username = {
            username: req.params.name
        }
        const update = {
            img: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            }
        }


        const user = await User.findOneAndUpdate(username, update, {
            new: true
        });
    
        if (!user) throw 'Username not exist';

        return res.status(201).json(user);
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
})

//search


module.exports = app;