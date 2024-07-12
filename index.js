const express = require("express");
const { MongoClient } = require("mongodb");

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

// Endpoint to fetch persons by birthdate range
app.post("/person/getDataByBirthDate", async (req, res) => {
  const { dateFrom, dateTo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    // Validate dateFrom and dateTo format
    if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Invalid date format. Please use YYYY-MM-DD.",
        });
    }

    // Construct query to find persons between dateFrom and dateTo
    const query = {
      birthdate: {
        $gte: dateFrom,
        $lte: dateTo,
      },
    };

    const persons = await collection.find(query).toArray();

    res
      .status(200)
      .json({
        status: 200,
        message: "Persons fetched successfully",
        data: persons,
      });
  } catch (err) {
    console.error("Error fetching persons by birthdate:", err);
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch persons by birthdate" });
  } finally {
    await client.close();
  }
});

// Helper function to validate date format
function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
