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

const scryfallApi = 'https://api.scryfall.com/cards'// - /setcode/cn
const router = express.Router();

router.get('/', async (req, res) =>{
        res.send('Please supply a database ID after /cards/').status(200);
});

router.get('/:id', async (req, res) =>{
    try {
        const collection = await db.collection("cards");
        const query = {_id: new ObjectId(req.params.id)};
        const result = await collection.findOne(query);
        res.send(result).status(200);
    }
    catch(e){
        res.send("Error: Incorrect ObjectId").status(400);
        console.log(e);
        // console.log(e.cause);
    }
});

router.post('/', async (req, res) =>{
    try {
        const collection = await db.collection("cards");
        if(req.body.set && req.body.cn) {
            //Thalia is the Guardian of Thraben.
            //In this case, she's guarding the Database from bad / extra data
            const thalia = {set: req.body.set, cn: req.body.cn}
            thalia.set = thalia.set.toLowerCase();
            const gatekeeper = await collection.findOne(thalia);
            if(await gatekeeper != null) return res.send('Card already in the Database!').status(200);
            else {
            // Haldan is the master of Pako, Arcane Retriever.
            // Haldan is telling Pako what to 'Fetch'
                const haldan = scryfallApi+'/'+thalia.set+'/'+thalia.cn;
            // Pako is a dog. He is good at fetching.
                const pako = await fetch(haldan.toLowerCase());
                const sfData = await pako.json();
                thalia.name = sfData.name;
                thalia.images = sfData.image_uris;
                const result = await collection.insertOne(thalia);
                res.send(result).status(204);
            }
        } else{
            throw new Error('Incomplete Information',{ cause: 400});
        }
    }
    catch(e){
        if(e.cause === 400) res.send("Incomplete Information!").status(400);
        else res.send('Something went wrong...').status(500);
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