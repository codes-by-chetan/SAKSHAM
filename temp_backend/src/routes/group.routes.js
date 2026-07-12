import express from "express";
import protect from "../middlewares/auth.middleware.js";
import Group from "../models/group.model.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create group", error: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate("createdBy", "fullName email");
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch groups", error: error.message });
  }
});

export default router;
