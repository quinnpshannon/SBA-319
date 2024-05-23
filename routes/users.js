/*
Here is the format that we are looking for:
    {
        "email": "test@test.com",
        "password": "password123",
        "username": "testuser1"
    } 
*/
import express from 'express';
import db from '../db/conn.js'

const router = express.Router();

router.get('/', (req, res) =>{
    res.send('Forbidden: Not a chance buddy. Data is Secretive!').status(503);
});

router.post('/', async (req, res) =>{
    try {
        const collection = await db.collection("users");
        const newDocument = req.body;
        if(newDocument.email && newDocument.password && newDocument.username) {
            const result = await collection.findOne({ $or: [{username: newDocument.username},{email: newDocument.email}]});
            if(await result) {
                console.log(result);
                if(result.username == newDocument.username) throw new Error('User Already exists!',{cause: 400});
                if(result.email == newDocument.email) throw new Error('Email already registered!',{cause: 400});
            }
            newDocument.admin = false;
            newDocument.decks = [];
            const valid = await collection.insertOne(newDocument);
            res.send(valid).status(204);
        } else{
            throw new Error('Incomplete Information',{cause: 400});
        }
    }
    catch(e){
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

router.delete('/', async (req, res) =>{
    try {
        const collection = await db.collection("users");
        const newDocument = req.body;
        if(newDocument.password && newDocument.username) {
            const found = await collection.findOne(newDocument);
            if(await found){
                const result = await collection.deleteOne(newDocument);
                res.send(result).status(204);
            } else throw new Error('Incorrect credentials',{ cause: 400});
        } else throw new Error('Incomplete Information',{ cause: 400});
    }
    catch(e){
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

router.get('/:id', async (req, res) =>{
    try {
        const collection = await db.collection("users");
        const query = {username: req.params.id};
        console.log(query);
        const result = await collection.findOne(query);
        delete result.password;
        console.log(result);
        if(result) res.send(result).status(200);
        else throw new Error('No Such User',{ cause: 400});
    }
    catch(e){
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

export default router;