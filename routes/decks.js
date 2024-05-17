/*
Here is the format that we are looking for:
    {
        "name":"",
        "idNum":"",
        "set":"",
        "cards": [],
        "available": true
    } 
*/
import express from 'express';
import db from '../db/conn.js'
import { ObjectId } from 'mongodb';

const router = express.Router();


router.get('/', (req, res) =>{
    //display All the decklists
    res.send('All the lists').status(503);
});
router.get('/set/:set', async (req, res) =>{
    //display the decklists for the specified set. If there are several, show them all!
    try {
        const collection = await db.collection("decks");
        const query = {set: req.params.set};
        console.log(query);
        const result = await collection.find(query).toArray();
        if(result.length >0) res.json(result).status(200);
        else throw new Error(`No Decks from set ${req.params.set}`,{ cause: 400});
    }
    catch(e){
        console.log(e);
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

router.post('/', async (req, res) =>{
    try {
        const collection = await db.collection("decks");
        const newDocument = req.body;
        if(newDocument.name &&
            newDocument.idNum &&
            newDocument.set &&
            newDocument.cards &&
            newDocument.available
        ){
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