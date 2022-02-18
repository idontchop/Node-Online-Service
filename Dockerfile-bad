FROM node:14

RUN mkdir /node-online-service /node-online-service/config /node-online-service/models /node-online-service/public /node-online-service/test /node-online-service/bin /node-online-service/listener /node-online-service/routes /node-online-service/views
COPY * /node-online-service/
COPY config /node-online-service/config
COPY models /node-online-service/models
COPY public /node-online-service/public
COPY test /node-online-service/test
COPY bin /node-online-service/bin
COPY listener /node-online-service/listener
COPY routes /node-online-service/routes
COPY views /node-online-service/views

WORKDIR /node-online-service

RUN npm install --unsafe-perm

EXPOSE 3001
CMD [ "npm", "start"]