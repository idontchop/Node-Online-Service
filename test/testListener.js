import { Listener } from '../listener/listener.js'
import {db} from '../bin/mongodb.mjs'
import assert from 'assert'
import OnlineStore from '../models/OnlineStore.mjs'



describe('Tests Started', () => {
    it('Should say hi', () => {
        console.log("Hello node-online-service tests!")
    })
});

describe('Listener Instantiation and online user mockup', () => {


    it('Should report online user', async () => {
        
        let memberObject = {}
        let testKey = "TestUserTestUser"

        let listener = new Listener({defaultTimeout: 1, mockup: true})

        listener.registerOnlineCallBack('test', e => memberObject = e)

        // mock kafka message
        await listener.handleKafkaMessage({message: {key: testKey, headers: {"event-type": "event"}}})

        assert.strictEqual(memberObject.name,testKey, "Listener did not properly initiate callback for online user")
        assert.ok(memberObject.online, "Listener did not properly set user flag after callback")

        // how to test for timeout?
 
        setTimeout( async () => await listener.quit(), 1000)
    })
});

describe('Mongo Database', () => {

    it('Should write, read, and delete an online user', async () => {

        let testUserKey = "TestUserTestUser"
        let testDb = 'onlineNowTest'

        let testUser = {name: testUserKey, online: true, lastOnline: new Date()}

        const collection = db().collection(testDb)
        await collection.insertOne(testUser);

        const testUserRetrieved = await db().collection(testDb).findOne({name: testUserKey})

        assert.strictEqual(testUserRetrieved.name, testUser.name, "mongo config set? able to create / update onlineNowTest collection?")

        await db().collection(testDb).deleteMany({name: testUserKey})

        const testUserInDb = await db().collection(testDb).find({name: testUserKey}).toArray()

        assert.strictEqual(testUserInDb.length,0)


    })
})

describe('Mongo Write Test', () => {
    it('Should create new user', async () => {
        let memberObject = {name: "TestUser", online: true, lastOnline: new Date()}
        OnlineStore.update(memberObject)
    })

    it('Should Read TestUsers', async () => {
        let searchArray = ["TestUser", "TestUser2"]
        let result = await OnlineStore.read(searchArray)
        assert.strictEqual(result.length>0,true, "Check config for mongo settings. Unable to write TestUser memberObject")
    })
})
