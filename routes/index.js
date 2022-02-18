import os from 'os'
import express from 'express'
import http from 'http'
import OnlineStore from '../models/OnlineStore.mjs'
import listener from '../listener/listener.js'

var router = express.Router();

/**
 * Reads the request body and pulls the list of users
 * Request body can be an array of strings, or an object
 * with a "users" key
 * 
 * Returns the array of strings.
 * 
 * @param {Object} req 
 * @returns 
 */
function parseUserRequest(req) {
  let usersKey = "users"

  // Request Body accepts arrays of strings
  let queryUsers = req.body
  if (Object.keys(queryUsers).includes(usersKey)) queryUsers = queryUsers[usersKey]

  return queryUsers
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('See /helloWorld')
});

/**
 * Hello World
 */
router.get('/helloWorld', (req, res, next) => {

  const helloWorldMessage = {
    "message": 'Hello from online-service',
    "service": 'online-service',
    "host": os.hostname()
  }

  res.status(201).json(helloWorldMessage)
})

/**
 * Last Online
 * 
 * Accepts an array of users in the body to check for last online status
 * May also accept an object with a users key which must be array
 */
router.post('/lastOnline', async (req, res, next) => {

  try {
    let queryUsers = parseUserRequest(req)
    if (!Array.isArray(queryUsers)) {
      throw {status: 405, message: "Request Body must be array!"}
    } else {

      // Read list of users from database, strip mongo _id
      let onlineSince = await OnlineStore.read(queryUsers, {'_id': 0})
      res.status(200).json({users: onlineSince})

    }
  } catch (err) {
    next (err)
  }

})

/**
 * Online Now. GET
 * Acesses the Listener object directly, does not display any offline users.
 * 
 */
router.get('/onlineNow', async (req, res, next) => {

  let onlineUsers = listener.getOnlineNow()

  res.status(200).json(onlineUsers)

})

/**
 * Online Now. POST
 * 
 * Returns the last online of all selected users as well as checking
 * the listener object for currently online.
 */

router.post('/onlineNow', async (req, res, next) => {

  let queryUsers = parseUserRequest(req)
  let onlineUsers = listener.getOnlineNow().map(e => e.name)

  try {
    if (!Array.isArray(queryUsers)) {
      throw {status: 405, message: "Request Body must be array!"}
    } else {

      // Read list of users from database, strip mongo _id
      let onlineSince = await OnlineStore.read(queryUsers, {'_id': 0})

      // check if online now, if so, add online:true
      onlineSince = onlineSince.map(e => onlineUsers.includes(e.name) ? {online: true, ...e} : e)

      res.status(200).json({users: onlineSince})

    }
  } catch (err) {
    next (err)
  }

})

/**
 * Test relaying helloWorld notification, verifies private connection
 */
router.get('/helloNotification', (req, res, next) => {
  //const notificationUrl = "http://staging:8083/helloWorld"

  // const httpreq = http.request(notificationUrl)
  const httpreq = http.request({
    host: "staging",
    port: 8083,
    path: '/helloWorld',
    method: 'GET'
  })
  
  httpreq.on('response', (r) => {
    r.on('data', (d) => {
      let data = JSON.parse(d)
      res.send(data)
    })
    r.on('error', (err) => next(err))
  });
  httpreq.end();
})



export default router
