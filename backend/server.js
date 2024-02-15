const express = require("express"),
   cors = require("cors"),
   { MongoClient, ObjectId } = require("mongodb"),
   fs = require('fs'),
   http = require('http'),
   https = require('https'),
   app = express();

//const privKey = fs.readFileSync('/etc/incommon/privkey.pem');
//const cert = fs.readFileSync('/etc/incommon/fullchain.pem');
//const credentials = {key: privKey, cert: cert};

// SWAP OUT LOCALHOST CORS AFTER TESTING PHASE
app.use(cors());

app.use(express.static("public"));
app.use(express.json());

app.set('trust proxy', true)

const uri = `mongodb+srv://pointbeing:4.fk68SabCcbGFe@theca.diioglq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

let theca = null;
let user = null;

function getTimeStamp() {
   let today = new Date();
   return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'-'+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}

async function run() {
   await client.connect();
   theca = await client.db("biblio").collection("theca");
   user = await client.db("biblio").collection("user");

   /*app.get( "/TEST", async (req,res) => {
      user.insertOne({player: "hAHA"})
      res.send("ok");
   });*/

   app.post( "/whosthere", async (req,res) => {
      if(!(await user.findOne({name: req.body.user}))) {
         res.send({
            result: "DENIED"
         });
         return;
      }

      res.send({
         result: "ok"
      });
   });

   app.post( "/addbook", async (req,res) => {
      if(!(await user.findOne({name: req.body.user}))) {
         res.send({
            result: "DENIED"
         });
         return;
      }

      await theca.insertOne(
         {isbn: req.body.isbn}
      )

      res.send("done");
   });

   app.post( "/removebook", async (req,res) => {
      if(!(await user.findOne({name: req.body.user}))) {
         res.send({
            result: "DENIED"
         });
         return;
      }

      await theca.deleteOne(
         {isbn: req.body.isbn}
      )

      res.send("done");
   });

   app.post( "/updatebook", async (req,res) => {
      if(!(await user.findOne({name: req.body.user}))) {
         res.send({
            result: "DENIED"
         });
         return;
      }

      const changeout = {}
      changeout[req.body.key] = req.body.newValue;

      //console.log(changeout)

      await theca.updateOne(
         {isbn: req.body.isbn},
         { $set: changeout }
      )

      res.send("done");
   });

   app.post( "/getbooks", async (req,res) => {
      if(!(await user.findOne({name: req.body.user}))) {
         res.send({
            result: "DENIED"
         });
         return;
      }

      res.send(await theca.find().toArray());
   });
}

run()


const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

httpServer.listen(8080, "localhost", () => console.log('API is running on :8080, what spooky conundrums abound'));
//httpsServer.listen(8443, () => console.log('API is running on :8443, what incredible mysteries await'));
