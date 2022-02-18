# Node Online Service
This is a minimal online user service written to be dropped into an Event-Driven microservice architecture. If events are keyed to the user, simply modifying config/default.json with the Kafka bootstrap and Topics to be subscribed to will provide a service that tracks users who have generated an event in the last 300 seconds. Also persists the last event in a mongodb.
## Modules used
Config
> https://github.com/node-config/node-config

Express
> https://github.com/expressjs/express

Kafka JS
> https://github.com/tulios/kafkajs

MongoDb
> https://github.com/mongodb/node-mongodb-native

## Configuration

Modify config/default.json (or provide a production.json) with your kafka bootstrap and topics, mongo url and db, optionally change the server port (default 3001). Additional configurations relating to timeouts can be configured in listener/listener.js

## Development status
Note that this module was written to learn Node.js by a primarily Java/Spring developer. It has been used in a development staging environment but not in production. USE AT OWN RISK

## License
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
