const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3012;

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

// Enable CORS
app.use(cors());

// Helper function to validate date format
function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

// Helper function to hash passwords
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to compare passwords
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign(user, "your_jwt_secret", { expiresIn: "1h" });
}

// Endpoint to fetch persons by birthdate range
app.post("/person/getDataByBirthDate", async (req, res) => {
  const { dateFrom, dateTo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    // Validate dateFrom and dateTo format
    if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid date format. Please use YYYY-MM-DD.",
      });
    }

    // Construct query to find persons between dateFrom and dateTo
    const query = {
      birthday: {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      },
    };

    const persons = await collection.find(query).toArray();

    res.status(200).json({
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

// Create a new person
app.post("/person", async (req, res) => {
  const { fullname, birthday, email, password, photo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const hashedPassword = await hashPassword(password);
    const newPerson = {
      fullname,
      birthday: birthday,
      email,
      password: hashedPassword,
      photo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPerson);
    const person = await collection.findOne({
      _id: new ObjectId(result.insertedId),
    });

    res.status(201).json({
      status: 201,
      message: "Person created successfully",
      data: person,
    });
  } catch (err) {
    console.error("Error creating person:", err);
    res.status(500).json({ status: 500, message: "Failed to create person" });
  } finally {
    await client.close();
  }
});

// Read all persons
app.get("/persons", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const persons = await collection.find({}).toArray();

    res.status(200).json({
      status: 200,
      message: "Persons fetched successfully",
      data: persons,
    });
  } catch (err) {
    console.error("Error fetching persons:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch persons" });
  } finally {
    await client.close();
  }
});

// Read a person by ID
app.get("/person/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const person = await collection.findOne({ _id: new ObjectId(id) });

    if (!person) {
      return res.status(404).json({
        status: 404,
        message: "Person not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Person fetched successfully",
      data: person,
    });
  } catch (err) {
    console.error("Error fetching person:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch person" });
  } finally {
    await client.close();
  }
});

// Update a person by ID
app.put("/person/:id", async (req, res) => {
  const { id } = req.params;
  const { fullname, birthday, email, password, photo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedPerson = {
      fullname,
      birthday: birthday,
      email,
      ...(hashedPassword && { password: hashedPassword }),
      photo,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPerson }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Person not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Person updated successfully",
    });
  } catch (err) {
    console.error("Error updating person:", err);
    res.status(500).json({ status: 500, message: "Failed to update person" });
  } finally {
    await client.close();
  }
});

// Delete a person by ID
app.delete("/person/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Person not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Person deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting person:", err);
    res.status(500).json({ status: 500, message: "Failed to delete person" });
  } finally {
    await client.close();
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Person");

    // Find the person by email
    const person = await collection.findOne({ email });

    // Check if the person exists and if the password matches
    if (!person || !(await comparePassword(password, person.password))) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    // Generate a JWT token
    const token = generateToken({ id: person._id, email: person.email });

    // Return a successful response with token and person ID
    res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user: {
        _id: person._id,
        fullname: person.fullname,
        birthday: person.birthday,
        email: person.email,
        photo: person.photo,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      }, // Include the person's ID in the response
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ status: 500, message: "Failed to log in" });
  } finally {
    await client.close();
  }
});

// Create a new ticket
app.post("/ticket", async (req, res) => {
  const { title, description, status, assignedTo, createdAt } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Ticket");

    const newTicket = {
      title,
      description,
      status,
      assignedTo,
      createdAt: new Date(createdAt) || new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newTicket);
    const ticket = await collection.findOne({
      _id: new ObjectId(result.insertedId),
    });

    res.status(201).json({
      status: 201,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ status: 500, message: "Failed to create ticket" });
  } finally {
    await client.close();
  }
});

// Read all tickets
app.get("/tickets", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Ticket");

    const tickets = await collection.find({}).toArray();

    res.status(200).json({
      status: 200,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch tickets" });
  } finally {
    await client.close();
  }
});

// Read a ticket by ID
app.get("/ticket/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Ticket");

    const ticket = await collection.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch ticket" });
  } finally {
    await client.close();
  }
});

// Update a ticket by ID
app.put("/ticket/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Ticket");

    const updatedTicket = {
      title,
      description,
      status,
      assignedTo,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedTicket }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Ticket updated successfully",
    });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ status: 500, message: "Failed to update ticket" });
  } finally {
    await client.close();
  }
});

// Delete a ticket by ID
app.delete("/ticket/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const database = client.db("booking");
    const collection = database.collection("Ticket");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Ticket deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({ status: 500, message: "Failed to delete ticket" });
  } finally {
    await client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
