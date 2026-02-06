import express from "express";
import { upload } from "../middleware/upload.js";
import { verifyUserToken } from "../middleware/auth.js";
import { createComplaint, getComplaints } from "../controllers/complaint.js";
const complaint = express.Router();

complaint.post(
  "/create",
  verifyUserToken,
  upload.single("image"),
  createComplaint,
);
complaint.get("/userComplaints", verifyUserToken, getComplaints);
export default complaint;
