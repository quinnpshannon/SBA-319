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
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', (req, res) =>{
    res.send('Forbidden: Not a chance buddy. Data is Secretive!').status(503);
});

router.post('/', async (req, res) =>{
    try {
        const collection = await db.collection("users");
        const newDocument = req.body;
        if(newDocument.email && newDocument.password && newDocument.username) {
            const result = await collection.insertOne(newDocument);
            res.send(result).status(204);
        } else{
            throw new Error('Incomplete Information',{ cause: 400});
        }
    }
    catch(e){
        console.log(e);
        // console.log(e.cause);
    }
});

router.delete('/', async (req, res) =>{
    try {
        const collection = await db.collection("users");
        const newDocument = req.body;
        if(newDocument.password && newDocument.username) {
            const found = await collection.findOne(newDocument);
            console.log(found);
            if(found)
            // const result = await collection.deleteOne(newDocument);
            res.send(result).status(204);
        } else {
            throw new Error('Incomplete Information',{ cause: 400});
        }
    }
    catch(e){
        console.log(e);
        // console.log(e.cause);
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
        console.log(e);
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

export default router;