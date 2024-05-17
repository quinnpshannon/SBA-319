import express from 'express';
import dotenv from 'dotenv';
// import cors from 'cors';
import userRouter from '../routes/users.js';
import cardRouter from '../routes/cards.js';
import deckRouter from '../routes/decks.js';

//
dotenv.config();

//Declare the port for the app
const PORT = process.env.PORT || 9876;

//Declare the Express app
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method+'request from URL: '+req.url);
    next();
});

app.use('/decks', deckRouter);
app.use('/cards', cardRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {

    // res.redirect('/index.html');
})

app.use((err,_req,res,next) =>{
    res.status(500).send('Server Error!');
});

app.listen(PORT, () =>{
    console.log(`Server is running at http://localhost:${PORT}`)
});