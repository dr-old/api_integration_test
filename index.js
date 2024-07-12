const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection URI
const uri =
  "mongodb+srv://danniramdan96:ijoaWJGlPSycho4t@cluster0.bfkao8i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Initialize MongoDB client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Define routes and MongoDB operations
app.post("/persons", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const { fullName, birthdate } = req.body;
    const result = await collection.insertOne({ fullName, birthdate });

    res.status(201).json({ message: "Person created", person: result.ops[0] });
  } catch (err) {
    console.error("Error inserting person:", err);
    res.status(500).json({ message: "Failed to create person" });
  } finally {
    await client.close();
  }
});

app.get("/persons", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const persons = await collection.find().toArray();

    res.json(persons);
  } catch (err) {
    console.error("Error fetching persons:", err);
    res.status(500).json({ message: "Failed to fetch persons" });
  } finally {
    await client.close();
  }
});

app.post("/person/getDataByBirthDate", async (req, res) => {
  const { dateFrom, dateTo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    // Construct query to find persons between dateFrom and dateTo
    const query = {
      birthdate: {
        $gte: dateFrom,
        $lte: dateTo,
      },
    };

    const persons = await collection.find(query).toArray();

    res.json(persons);
  } catch (err) {
    console.error("Error fetching persons by birthdate:", err);
    res.status(500).json({ message: "Failed to fetch persons by birthdate" });
  } finally {
    await client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
