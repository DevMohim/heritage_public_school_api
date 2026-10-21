import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

//Make all teacher api
router.get("/", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const cursor = teachersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

//Get a single teacher api
router.get("/:id", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const id = req.params.id;
  const result = await teachersCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

//Create one New teacher api
router.post("/", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const newTeacher = req.body;
  const result = await teachersCollection.insertOne(newTeacher);
  res.send(result);
});

//update teacher active status
router.patch("/:id", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const id = req.params.id;
  const updateStatus = req.body;
  const result = await teachersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updateStatus,
    },
  );
  res.send(result);
});

//Update a teacher info
router.patch("/:id", async(req, res) => {
  const id = req.params.id;
  const teachersCollection = req.app.locals.teachersCollection;
  const updatedData = req.body
  const result = await teachersCollection.updateOne(
   {_id: new ObjectId(id)},
   {
      $set : updatedData
   }
  )
  res.send(result)
});

//Delete a Teacher data
router.delete("/:id", async (req, res) => {
  const teachersCollection = req.app.locals.teachersCollection;
  const id = req.params.id;
  const result = await teachersCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

export default router;
