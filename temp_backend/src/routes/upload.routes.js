import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/upload.util.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

router.delete("/:publicId", protect, async (req, res) => {
  try {
    const deleted = await deleteFromCloudinary(req.params.publicId);
    res.json({ success: true, deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", error: error.message });
  }
});

export default router;
