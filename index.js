const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4900;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("antopolis");
    const foodItemCollection = db.collection("foodItem");

    // POST: Add a new food item
    app.post("/foodItem", async (req, res) => {
      const foodItem = req.body;

      try {
        const result = await foodItemCollection.insertOne(foodItem);
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        console.error("Insert error:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });

    // GET: All food items
    app.get("/foodItem", async (req, res) => {
      try {
        const result = await foodItemCollection.find().toArray();
        res.status(200).json(result);
      } catch (error) {
        console.error("Fetch all error:", error);
        res.status(500).json({ message: "Failed to fetch food items" });
      }
    });

    // GET: Single food item by ID
    app.get("/foodItem/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const item = await foodItemCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!item) {
          return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json(item);
      } catch (error) {
        console.error("Fetch by ID error:", error);
        res.status(400).json({ message: "Invalid ID format" });
      }
    });

    // DELETE: Food item by ID
    app.delete("/foodItem/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodItemCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json({ message: "Deleted successfully" });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(400).json({ message: "Invalid ID format" });
      }
    });

    // Health check
    app.get("/", (req, res) => {
      res.json({
        message: "Server is running smoothly",
        timestamp: new Date(),
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } finally {
    // Do not close MongoDB in dev mode
    // await client.close();
  }
}

run().catch(console.error);
