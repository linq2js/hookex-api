const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

const uri =
  "mongodb+srv://demo:8XbI4nYplCRAwS4A@cluster0-ionng.mongodb.net/test?retryWrites=true&w=majority";
let globalClient;

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(cors());
app.use(bodyParser());

async function connect() {
  if (globalClient && globalClient.isConnected()) return globalClient;
  globalClient = new MongoClient(uri, { useNewUrlParser: true });
  return new Promise((resolve, reject) => {
    globalClient.connect(err => {
      err ? reject(err) : resolve(globalClient);
    });
  });
}

app.post(
  "/query",
  asyncMiddleware(async (req, res) => {
    const { db, collection, actions = { find: [{}] } } = req.body;
    console.log(db, collection);
    const client = await connect();
    let target = client.db(db).collection(collection);

    Object.keys(actions).forEach(action => {
      target =
        typeof target[action] === "function"
          ? target[action](...(actions[action] || []))
          : target[action];
    });

    return res.json(await target);
  })
);

app.listen(port);

console.log("RESTful API server started on::" + port);
