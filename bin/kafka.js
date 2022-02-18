import { Kafka } from 'kafkajs'
import config from 'config'


// Create the client with the broker list
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [config.get("kafka-consumer.bootstrap")]
  })

console.log("groupid: ", config.get("kafka-consumer.groupId"))
const consumer = kafka.consumer({groupId: config.get("kafka-consumer.groupId")})

await consumer.connect()

export default consumer
