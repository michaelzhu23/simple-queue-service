# Backend Simple Queue Service
A coding assessment I did as part of the interview process for a company.

## Instructions
Create a simple backend queue service. Queue consumers should be able to create a queue, send a message to the queue, receive a message to the queue and tell the queue it’s done and to delete the message. Unlike a pub/sub model, end users of this queue should be responsible for receiving and deleting messages, using polling or another alternative.

This should be a web server that exposes the following 4 methods:

| URL | Request Params | Return |
| ------------- | ------------- | ------------- |
| /CreateQueue  | queueName | created |
| /SendMessage  | queueName, delayInMS, message | messageId |
| /ReceiveMessage | queueName  | messageId,message |
| /DeleteMessage  | queueName, messageId | wasDeleted |


Use any languages, libraries, or frameworks, except for the queue itself which should be mostly your own invention.

Please additionally include in your submission:
* README.md, including what you would have done if you had more time and how to run and test your system.
* Unit tests.

## Technologies Used

- Node.js
- Express.js
- MongoDB Database

### Getting Started

1. Install all dependencies with yarn:
   ```shell
   yarn
   ```
2. Provide environment variables for server port & MongoDB database:
   ```shell
   MONGODB_URI
   DB_NAME
   DB_COLLECTION_NAME
   PORT
   ```
3. Start the server:
   ```shell
   yarn start
   ```
   This will start the server on the specified port number and connect to the MongoDB instance using the specified URI. Once started, you can verify that the server is working by opening http://localhost:3000 in your browser and seeing "Hello World!".
4. Test the system using a REST client like Postman by sending HTTP requests to each endpoint with the required request params.
