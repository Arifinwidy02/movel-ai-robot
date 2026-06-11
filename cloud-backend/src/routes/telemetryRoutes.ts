import { Router } from "express";
import {
  addRobotCommand,
  fetchAndClearCommands,
  getRobotStatus,
  saveTelemetry,
} from "../controllers/telemetryController";

const router = Router();

// EP Post
router.post("/internals/telemetry", saveTelemetry);

// EP get
router.get("/robots/:id/status", getRobotStatus);

// Command baru
router.post("/robots/:id/commands", addRobotCommand);

router.get("/internals/robots/:id/commands", fetchAndClearCommands);

router.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Cloud Backend is running smoothly" });
});

export default router;
