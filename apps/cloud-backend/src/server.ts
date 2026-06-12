import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import telemetryRoutes from "./routes/telemetryRoutes";

dotenv.config();
const app = express();
const PORT = process.env.NODE_ENV || 4000;

// middleware
app.use(cors());
app.use(bodyParser.json());

// Main routes
app.use("/api", telemetryRoutes);

app.listen(PORT, () => {
  console.log(
    `🚀 [CLOUD BACKEND] Server mendengarkan di http://localhost:${PORT}`,
  );
});
