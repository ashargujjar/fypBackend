import express from "express";
import { upload } from "../middleware/upload.js";
import { verifyUserToken } from "../middleware/auth.js";
import {
  createComplaint,
  getAllComplaints,
  getComplaints,
  UpdateComplainstatus,
} from "../controllers/complaint.js";
const complaint = express.Router();

complaint.post(
  "/create",
  verifyUserToken,
  upload.single("image"),
  createComplaint,
);
complaint.get("/userComplaints", verifyUserToken, getComplaints);
complaint.get("/Allcomplaints", verifyUserToken, getAllComplaints);
complaint.put(
  "/updateStatus/:complaintId",
  verifyUserToken,
  UpdateComplainstatus,
);
export default complaint;
