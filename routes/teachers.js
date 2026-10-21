import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all teachers
router.get("/", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const result = await teachersCollection.find().toArray();
  res.json(result);
});

// Get a single teacher
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid teacher id" });
  }
  const teachersCollection = req.app.locals.teachersCollection;
  const result = await teachersCollection.findOne({ _id: new ObjectId(id) });
  if (!result) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  res.json(result);
});

// Create a new teacher
router.post("/", async (req, res) => {
  const newTeacher = req.body;
  if (!newTeacher || Object.keys(newTeacher).length === 0) {
    return res.status(400).json({ message: "Teacher data is required" });
  }
  const teachersCollection = req.app.locals.teachersCollection;
  const result = await teachersCollection.insertOne(newTeacher);
  res.status(201).json(result);
});

// Update a teacher info / active status
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid teacher id" });
  }
  const updatedData = req.body;
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: "Update data is required" });
  }
  const teachersCollection = req.app.locals.teachersCollection;
  const result = await teachersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updatedData,
    },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  res.json(result);
});

// Delete a teacher
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid teacher id" });
  }
  const teachersCollection = req.app.locals.teachersCollection;
  const result = await teachersCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  res.json(result);
});

export default router;
