import express from "express";
import protect from "../middlewares/auth.middleware.js";
import Expense from "../models/expense.model.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      paidBy: req.user._id,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create expense", error: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ paidBy: req.user._id }).populate("group", "name").populate("paidBy", "fullName");
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch expenses", error: error.message });
  }
});

export default router;
