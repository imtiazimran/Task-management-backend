const express = require('express');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()

app.use(express.json())
app.use(cors())


const uri = process.env.DATABASE_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = await client.db('ChainTech')
        const TASKS = db.collection('TASKS')


        // send all the tasks
        app.get("/tasks", async (req, res) => {
            const result = await TASKS.find().toArray()
            res.send(result)
        });

        // add tasks
        app.post("/addTask", async (req, res) => {
            const newTask = req.body;
            try {
                const result = await TASKS.insertOne(newTask)
                res.status(201).json(result)
            } catch (error) {
                console.log("Error Creating Tasks:", error);
                res.status(500).json({ error: "Internel Server Error" })
            }
        });



        // Update task
        app.patch("/updateTask/:id", async (req, res) => {
            const taskId = req.params.id;
            const updatedData = req.body;
            const query = { _id: new ObjectId(taskId) }

            console.log(taskId, updatedData);

            delete updatedData._id;

            try {
                const result = await TASKS.updateOne(query, {
                    $set: updatedData
                })
                if (result.matchedCount === 0) {
                    res.status(404).json({ error: 'Task not found' });
                } else {
                    res.json({ message: 'Task updated successfully' });
                }
            } catch (error) {
                console.log("Error While Updating Data:", error)
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Delete Tasks 
        app.delete("/deleteTask/:id", async (req, res) => {
            const taskId = req.params.id;
            const query = { _id: new ObjectId(taskId) }
            try {
                const result = await TASKS.deleteOne(query)
                if (result.deletedCount === 0) {
                    res.status(404).json({ error: 'Task not found' });
                } else {
                    res.json({ message: 'Task deleted successfully' });
                }
            } catch (error) {
                console.error('Error deleting task:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })


        // default response from the server
        app.get("/", (req, res) => {
            res.send("Welcome to Task Management service with ChainTech")
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`ChainTech Is Running On Port: ${port}`)
})

