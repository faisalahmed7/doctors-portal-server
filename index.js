const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000


//Middleware

app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.98ofi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     console.log("DB IS CONNECTED")
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });
async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db('doctorsPortal').collection('services');
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray()
            res.send(services)


        })


    }
    finally {

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello From Doctor Portals Server!')
})

app.listen(port, () => {
    console.log(`Doctors is listening on port ${port}`)
})