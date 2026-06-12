import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import telemetryRoutes from "./routes/telemetryRoutes";
import errorHandler from "./middleware/errorHandler";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

app.use("/api", telemetryRoutes);

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log(`🔌 [WEBSOCKET] Client baru terhubung! ID: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ [WEBSOCKET] Client terputus: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `🚀 [CLOUD BACKEND] Server mendengarkan di port ${PORT}`,
  );
});
