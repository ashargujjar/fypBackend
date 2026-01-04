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
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.port || 3000;
const rawCorsOrigins =
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  process.env.FROTEND_URL;
const corsOrigins =
  rawCorsOrigins && rawCorsOrigins.trim().length > 0
    ? rawCorsOrigins.split(",").map((origin) => origin.trim())
    : "*";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(
  cors({
    origin: corsOrigins,
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
