import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

//make all student API
router.get("/", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const cursor = studentsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

//Get a single student
router.get("/:id", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const id = req.params.id;
  const result = await studentsCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

//Create a New Student
router.post("/", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const newStudent = req.body;
  const result = await studentsCollection.insertOne(newStudent);
  res.send(result);
});

//Update a student info
router.patch("/:id", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const id = req.params.id;
  const updatedData = req.body;
  const result = await studentsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updatedData,
    },
  );
  res.send(result);
});

//Delete a student
router.delete("/:id", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const id = req.params.id;
  const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

export default router;
