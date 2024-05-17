import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.ATLAS_URI);

let conn;

try{
    conn = await client.connect();
} catch (error) {

}

const db = conn.db('sba_319');

export default db;