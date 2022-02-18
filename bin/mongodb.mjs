import mongodb from 'mongodb'; 
const MongoClient = mongodb.MongoClient;

import DBG from 'debug';
const debug = DBG('notes:notes-mongodb'); 
const error = DBG('notes:error-mongodb'); 

import config from 'config'

let client;

(async () => { 
    if (!client) client = await MongoClient.connect(config.get("mongo.url"));
})()

export const db = () => { return client.db(config.get("mongo.db")); };
