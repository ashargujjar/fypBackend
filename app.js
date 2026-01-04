import express from "express";
import admin from "./routes/admin.js";
import user from "./routes/user.js";
import rider from "./routes/rider.js";
import shipment from "./routes/shipments.js";
import payments from "./routes/payments.js";
import complaint from "./routes/complaint.js";
import cors from "cors";
import dotenv from "dotenv";
import { connectdb } from "./db/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
dotenv.config();

app.use(
  cors({
    origin: "https://shipsmart12.netlify.app/",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/admin", admin);
app.use("/user", user);
app.use("/rider", rider);
app.use("/shipment", shipment);
app.use("/payments", payments);
app.use("/complaint", complaint);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  connectdb(() => {
    console.log("database connected successfully");
    console.log(`Server running on port ${PORT}`);
  });
});
