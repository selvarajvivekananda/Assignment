const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs')

dotenv.config();

const { USER_NAME, PASSWORD, API_KEY } = process.env;

const router = express.Router();

const formResponse = (responseData) => ({ responseData });

const authorizeJwt = (req, res, next) => {
    const authToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (authToken == null) res.send({ status: 401, error: 'authToken is null' });
    jwt.verify(authToken, API_KEY, (err, reqBody) => {
        if (err) return res.send({ status: 403, error: 'authToken is invalid' });
        next();
        return '';
    });
};

router.post('/gettoken', (req, res) => {
    const body = req.body;
    // can send expiration in the below sign method
    const yourAccessToken = jwt.sign(body, API_KEY);
    res.json({ yourAccessToken });
});

router.post('/login', authorizeJwt, async (req, res) => {
    try {
        if (req.body.user_name == USER_NAME && req.body.password == PASSWORD) {
            res.send(formResponse({ status: "Valid User" }));
        }
        else {
            res.send(formResponse({ status: "Invalid User" }));
        }
    } catch (error) {
        console.error('error');
    }
});

router.get('/getTodo', authorizeJwt, (req, res) => {
    try {
        fs.readFile('./database.json', 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
            } else {
                // parse JSON string to JSON object
                const databases = JSON.parse(data);
                res.send(formResponse({ databases }));
            }
        });
    } catch (error) {
        console.error('error');
    }
});

router.post('/addTodo', authorizeJwt, async (req, res) => {
    try {
        const fileData = JSON.parse(fs.readFileSync('./database.json'))
        fileData.push(req.body)
        fs.writeFileSync('./database.json', JSON.stringify(fileData, null, 2))
        res.send({status:'sucessfully added'});
    } catch (error) {
        console.error('error');
    }
})

router.put('/updateTodo', authorizeJwt, async (req, res) => {
    try {
        const {task} = req.body
        const fileData = JSON.parse(fs.readFileSync('./database.json'))
        const updatedData = fileData.map(item => (task == item.task) ? req.body : item )
        console.log(updatedData)
        fs.writeFileSync('./database.json', JSON.stringify(updatedData, null, 2))
        res.send({status:'sucessfully updated'});
    } catch (error) {
        console.error('error');
    }
})

router.delete('/deleteTodo', authorizeJwt, async (req, res) => {
    try {
        const {task} = req.body
        console.log("task", task)
        const fileData = JSON.parse(fs.readFileSync('./database.json'))
        console.log(fileData)
        const updatedData = fileData.filter(item => (task !== item.task))
        console.log(updatedData)
        fs.writeFileSync('./database.json', JSON.stringify(updatedData, null, 2))
        res.send({status:'sucessfully deleted'});
    } catch (error) {
        console.error('error');
    }
})



module.exports = router;
