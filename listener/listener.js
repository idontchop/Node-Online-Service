
import consumer from '../bin/kafka.js'
import config from 'config'


/**
 * Listens to a message stream from kafka topics (kafka-consumer.topics) and tracks
 * online users based on the message key.
 * 
 * The message key is used to update this.onlineNow. An interval checks if a new message from the
 * user has been received in a specified amount of time (online-properties.timeout).
 * 
 * Callbacks are added via registerOnlineCallBack. By default, the callbacks are only updated when
 * a user goes off line, assuming the only data needed to be persisted is the last online when the
 * user is not online. This behavior can be changed in config, but a constant stream of last online
 * updates could be resource intensive.
 * 
 */
export class Listener  {

    listenerConfig = {
        defaultTimeout: 300,         // online timeout after last event in seconds
        onlineCheckInterval: 5,      // interval to check for last online in seconds
        updateAllEvents: false,      // if true, callbacks on all events
        debug: process.env.NODE_ENV === "development",                 // prints console messages
        mockup: false,               // if set to true, no kafka connection made
        acceptedEventTypes: []       // leave empty to track all events, uses headers['event-type']
    }

    constructor (conf = null) {

        // Changing config, use at own risk
        if(conf) {
            this.listenerConfig = {...this.listenerConfig, ...conf}
        }

        this.listenerConfig.debug && console.log("Constructing Listener")

        if (!this.listenerConfig.mockup) {
            // subscribe to all configured topics
            config.get("kafka-consumer.topics").forEach( async topic => {
                await consumer.subscribe({topic: topic, fromBeginning: true})
            } )

            // start listener on each message
            consumer.run({
                eachMessage: this.handleKafkaMessage
            })
        }

        // Set interval that checks for users no longer online
        // runs every 5 seconds
        setInterval(() => {
            this.checkOnlineStatus()
        }, this.onlineCheckInterval);
    }

    // holds object with username and last online
    onlineNow = []

    // time in seconds when a user is considered not online
    timeout = config.has("online-properties.timeout") ?
        config.get("online-properties.timeout") : this.listenerConfig.defaultTimeout

    // online call backs, cycled through whenever a user goes offline (to update last online)
    // sorted by tags
    onlineCallBacks = {}

    /****************
     * Getters
     ****************/


    getConfig () {
        return this.listenerConfig
    }

    getOnlineNow () {
        return this.onlineNow
    }

    /***************
     * End Getters
     ***************/



    /******************
     * Call Backs
     ******************/

    // called to set event listener
    // callbacks are sent the data in this.onlineNow when online status changes
    // { name: String, online: bool, lastOnline: Date() }
    registerOnlineCallBack = (tag, callback) => {
        this.onlineCallBacks[tag] = callback
    }

    unregisterOnlineCallBack = (tag) => {
        delete this.onlineCallBacks[tag]
    }

    onlineEvent = (payload) => {
        Object.entries(this.onlineCallBacks).forEach( ([k,e]) => {
            this.listenerConfig.debug && console.log("Callback: ", k)
            e(payload)
        })
    }

    /***************
     * End Call Backs
     ***************/    


    /**
     * Iterates onlineNow and checks for last event greater than timeout.
     * If exists, removes the user and does callbacks
     * 
     * This method is run by setInterval in constructor
     */
    checkOnlineStatus = () => {

        let date = new Date()

        // simple filter if onlineNow is always polled
        this.onlineNow = this.onlineNow
            .map( e => {
                if ( date - e.lastOnline > this.timeout * 1000) {
                    // do call back if 5 minutes old and about to be removed
                    this.onlineEvent({online: false, ...e})
                }
                return e
            })
            .filter ( e => date - e.lastOnline < this.timeout * 1000)

    }

    /**
     * Receives { name: String, lastOnline: Date()}
     * 
     * This will add or update the member to the onlineNow object and fire a callback
     * when the user is newly online
     * 
     * @param {obj} memberObject 
     */
    addOnlineUser = (memberObject) => {

        // get index if exists
        let index = this.onlineNow.findIndex( e => e.name === memberObject.name)

        if (index === -1) {

            // not found, add to array
            this.onlineNow.push(memberObject)

            // do callback
            this.onlineEvent({online: true, ...memberObject})

        } else {
            
            // found, update, no need to callback
            this.onlineNow[index] = memberObject
        }

    }

    handleKafkaMessage = async ({message}) => {

        this.listenerConfig.debug && console.log("Message: ", message.key.toString(), message.headers['event-type'].toString())

        // Add to this.onlineNow if event is accepted or acceptable events not configured
        if (this.listenerConfig.acceptedEventTypes.length == 0 ||
            this.listenerConfig.acceptedEventTypes.includes(message.headers['event-type'].toString()) ) {

            let memberObject = {
                name: message.key.toString(),
                lastOnline: new Date()
            }

            this.addOnlineUser(memberObject)

        }
    }

    /**
     * Kills entire app.
     */
    quit = async () => {
        if (!this.listenerConfig.mockup) {
            consumer.disconnect()
        }
        process.exit(0)
    }


}

const listener = new Listener()
export default listener