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
const scryfallApi = 'https://api.scryfall.com/cards'

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

router.patch('/:id', async (req, res) =>{
    try {
        const decks = await db.collection("decks");
        const cardList = req.body;
        if(!cardList.cards) throw new Error('No list of Cards!',{ cause: 400});
        if(cardList.cards.length != 20) throw new Error('Incorrect card count!',{ cause: 400});
        const found = await decks.findOne({_id: new ObjectId(req.params.id)});
        if(!found) throw new Error('Incorrect ID!',{ cause: 400});
        const cards = await db.collection("cards");
        cardList.cards.forEach(async element => {
            const card = await cards.findOne(element);
            if(await card === null){
                setTimeout(async () => {
                    const thalia = {set: element.set, cn: element.cn}
                    thalia.set = thalia.set.toLowerCase();
                    const haldan = scryfallApi+'/'+thalia.set+'/'+thalia.cn;
                    // Pako is a dog. He is good at fetching.
                    const pako = await fetch(haldan.toLowerCase());
                    const sfData = await pako.json();
                    thalia.name = sfData.name;
                    thalia.images = sfData.image_uris;
                    console.log('Adding Card: '+thalia.name);
                    await cards.insertOne(thalia);
                },500);
            }
        });
        cardList.set = await found.set.toLowerCase(); 
        const result = await decks.updateOne({ _id: found._id },{ $set: cardList});
        // const cards = await db.collection("cards");
        res.send(result).status(204);
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
            const valid = await auth.findOne({username: newDocument.username, password: newDocument.password, admin: true})
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