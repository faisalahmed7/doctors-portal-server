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
        const bookingsCollection = client.db('doctorsPortal').collection('bookings');


        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/available', async (req, res) => {
            const date = req.query.date;

            // step 1:  get all services
            const services = await servicesCollection.find().toArray();

            // step 2: get the booking of that day. output
            const query = { date: date };
            const bookings = await bookingsCollection.find(query).toArray();

            // step 3: for each service
            services.forEach(service => {

                // step 4: find bookings for that service. 
                const serviceBookings = bookings.filter(b => b.treatmentName === service.name);

                // step 5: select slots for the service bookings
                const bookedSlots = serviceBookings.map(book => book.slot);

                // step 6: select those slots that are not in bookedSlots
                const available = service.slots.filter(slot => !bookedSlots.includes(slot));

                //step 7: set available to slots to make it easier 
                service.slots = available;

            })
            res.send(services)
        })

        /**
             * API Naming Convention
             * app.get('/booking') // get all bookings in this collection. or get more than one or by filter
             * app.get('/booking/:id') // get a specific booking 
             * app.post('/booking') // add a new booking
             * app.patch('/booking/:id) //
             * app.delete('/booking/:id) //
            */

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatmentName: booking.treatmentName, date: booking.date, patient: booking.patient }
            const exists = await bookingsCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingsCollection.insertOne(booking);
            return res.send({ success: true, result });
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