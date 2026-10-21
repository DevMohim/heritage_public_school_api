import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  const studentsCollection = req.app.locals.studentsCollection;
  const result = await studentsCollection.find().toArray();
  res.json(result);
});

// Get a single student
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }
  const studentsCollection = req.app.locals.studentsCollection;
  const result = await studentsCollection.findOne({ _id: new ObjectId(id) });
  if (!result) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(result);
});

// Create a new student
router.post("/", async (req, res) => {
  const newStudent = req.body;
  if (!newStudent || Object.keys(newStudent).length === 0) {
    return res.status(400).json({ message: "Student data is required" });
  }
  const studentsCollection = req.app.locals.studentsCollection;
  const result = await studentsCollection.insertOne(newStudent);
  res.status(201).json(result);
});

// Update a student info
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }
  const updatedData = req.body;
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: "Update data is required" });
  }
  const studentsCollection = req.app.locals.studentsCollection;
  const result = await studentsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updatedData,
    },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(result);
});

// Delete a student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student id" });
  }
  const studentsCollection = req.app.locals.studentsCollection;
  const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(result);
});

export default router;
