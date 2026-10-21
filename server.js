import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";

import studentsRoutes from "./routes/students.js";
import teachersRoutes from "./routes/teachers.js";

const app = express();
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const client = new MongoClient(uri);
const dbPromise = client
  .connect()
  .then(() => client.db("School-Management-DB"));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// MongoDB connect হওয়ার পর collections attach করে routes চালু হবে
app.use(async (req, res, next) => {
  try {
    const db = await dbPromise;
    app.locals.studentsCollection = db.collection("Students");
    app.locals.teachersCollection = db.collection("Teachers");
    next();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/students", studentsRoutes);
app.use("/teachers", teachersRoutes);

// লোকাল development-এ server চালু রাখুন
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
