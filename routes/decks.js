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

router.get('/:id', async (req, res) =>{
    // display the specific decklist
    try {
        const collection = await db.collection("decks");
        const found = await collection.findOne({_id: new ObjectId(req.params.id)});
        const result = await found;
        if(result) res.json(result).status(200);
        else throw new Error(`No Deck with ID ${req.params.id}`,{ cause: 400});
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
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

router.delete('/:id', async (req, res) =>{
    try {
        const auth = await db.collection("users");
        const newDocument = req.body;
        if(newDocument.username && newDocument.password){
            const valid = await auth.findOne({username: newDocument.username, password: newDocument.password})
            const collection = await db.collection("decks");
            if(await valid) {
                const found = await collection.findOne({_id: new ObjectId(req.params.id)});
                if(await found){
                    const result = await collection.deleteOne({_id: new ObjectId(req.params.id)});
                    res.send(result).status(204);
                } else res.send('No Deck to delete!').status(400);
                
            } else {
                res.send('Access Denied').status(204);
            }
        } else {
            throw new Error('Incomplete Information',{ cause: 400});
        }
    }
    catch(e){
        console.log(e);
        const result = `<p> ${e}</p>`
        res.send(result).status(e.cause);
    }
});

export default router;