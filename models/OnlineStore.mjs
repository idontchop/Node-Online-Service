import {db} from '../bin/mongodb.mjs'

/**
 * Quick online store.
 * 
 * Persists objects in the form of: {
 *  name: String
 *  lastOnline: Date
 * }
 */
const OnlineStore = {

    /**
     * Persists to database a user and their lastOnline time.
     * 
     * @param {Object} param0 
     */
    async update({name, lastOnline}) {

        // strip online flag
        let member = {name, lastOnline}

        const collection = db().collection('onlineNow')
        await collection.updateOne({name: member.name},
            {$set: member},
            {upsert: true})

    },

    /**
     * Returns an array of entries 
     * with corresponding names
     * 
     * Use fields to strip certain fields (id)
     * 
     * @param {Array} names
     * @param {fields} object 
     * @Returns {Array}
     */
    async read(names, fields = null) {

        const collection = db().collection('onlineNow')

        let query = { name: {"$in": names}}

        if (fields) return collection.find(query).project(fields).toArray()
        else return collection.find(query).toArray()

    }

}

export default OnlineStore