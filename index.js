import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());

let db;
let collection;

MongoClient.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    db = client.db(process.env.DB_NAME);
    collection = db.collection(process.env.DB_COLLECTION_NAME);
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error(err);
  });

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.post("/CreateQueue", async (req, res) => {
  const { queueName } = req.body;

  if (!queueName) {
    return res.status(400).send("Queue name is required");
  }

  try {
    const result = await collection.countDocuments({
      queueName: { $eq: queueName },
    });

    if (result) {
      return res.status(409).send("Queue already exists");
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await collection.insertOne({ queueName, messages: [] });

    return res.status(201).send({ created: queueName });
  } catch (error) {
    console.error(error);
  }
});

app.post("/SendMessage", async (req, res) => {
  const { queueName, delayInMS = 0, message } = req.body;

  if (!queueName) {
    res.status(400).send("Queue name is required");
  }

  try {
    const result = await collection.countDocuments({
      queueName: { $eq: queueName },
    });

    if (!result) {
      return res.status(404).send("Queue not found");
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await collection.findOne({
      queueName: { $eq: queueName },
    });

    const messages = result.messages;
    const messageId = uuidv4();

    messages.push({
      messageId,
      message,
      createdAt: Date.now(),
      invisibleUntil: Date.now() + delayInMS,
    });

    await collection.updateOne(
      { queueName: { $eq: queueName } },
      { $set: { messages } }
    );

    return res.status(201).send({ messageId });
  } catch (error) {
    console.error(error);
  }
});

app.get("/ReceiveMessage", async (req, res) => {
  const { queueName } = req.query;

  if (!queueName) {
    res.status(400).send("Queue name is required");
  }

  try {
    const result = await collection.countDocuments({
      queueName: { $eq: queueName },
    });

    if (!result) {
      return res.status(404).send("Queue not found");
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await collection.findOne({
      queueName: { $eq: queueName },
    });
    const messages = result.messages;

    const now = Date.now();
    const messageToReceive = messages.find((msg) => msg.invisibleUntil <= now);

    if (!messages.length || !messageToReceive) {
      return res
        .status(404)
        .send("There are no messages in this queue at the moment");
    }

    const { messageId, message } = messageToReceive;

    return res.status(200).send({ messageId, message });
  } catch (error) {
    console.error(error);
  }
});

app.delete("/DeleteMessage", async (req, res) => {
  const { queueName, messageId } = req.query;

  if (!queueName) {
    return res.status(400).send("Queue name is required");
  }
  if (!messageId) {
    return res.status(400).send("Message ID is required");
  }

  try {
    const result = await collection.countDocuments({
      queueName: { $eq: queueName },
    });

    if (!result) {
      return res.status(404).send("Queue not found");
    }
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await collection.findOne({
      queueName: { $eq: queueName },
    });
    const messages = result.messages;

    const deleteMessageIndex = messages.findIndex(
      (msg) => msg.messageId === messageId
    );

    if (deleteMessageIndex === -1) {
      return res.status(404).send("Message not found");
    }

    messages.splice(deleteMessageIndex, 1);

    await collection.updateOne(
      { queueName: { $eq: queueName } },
      { $set: { messages } }
    );

    return res.status(200).send({ wasDeleted: true });
  } catch (error) {
    console.error(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
