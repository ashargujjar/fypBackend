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
); // Purpose: create complaint with optional image; Data: multipart/form-data (fields + image)
complaint.get("/userComplaints", verifyUserToken, getComplaints); // Purpose: list current user's complaints; Data: query params (optional filters)
complaint.get("/Allcomplaints", verifyUserToken, getAllComplaints); // Purpose: list all complaints; Data: query params (optional filters)
complaint.put(
  "/updateStatus/:complaintId",
  verifyUserToken,
  UpdateComplainstatus,
); // Purpose: update complaint status; Data: path param complaintId + JSON body (status/notes)
export default complaint;
