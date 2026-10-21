import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";

import studentsRoutes from "./routes/students.js";
import teachersRoutes from './routes/teachers.js'

const app = express();
const port = 5000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

async function startServer() {
  try {
    await client.connect();

    const db = client.db("School-Management-DB");
    app.locals.studentsCollection = db.collection("Students");
    app.locals.teachersCollection = db.collection('Teachers')

    app.use("/students", studentsRoutes);
    app.use('/teachers' , teachersRoutes)

   if (process.env.NODE_ENV !== "production") {
     app.listen(5000, () => console.log("Server running on port 5000"));
   }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
