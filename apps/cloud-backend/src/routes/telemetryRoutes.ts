import { Router } from "express";
import {
  addRobotCommand,
  fetchAndClearCommands,
  getRobotState,
  saveTelemetry,
  sendRobotCommand,
} from "../controllers/telemetryController";
import { lastTelemetryAt, pluginConnected } from "../state/robotState";

const router = Router();

router.get("/health", (req, res) => {
  const staleThreshold = 10_000;
  const now = Date.now();
  const lastAt = lastTelemetryAt ? new Date(lastTelemetryAt).getTime() : 0;
  const connected = pluginConnected && (now - lastAt) < staleThreshold;

  res.status(200).json({
    status: "ok",
    plugin_connected: connected,
    last_telemetry_at: lastTelemetryAt,
  });
});

router.get("/robot/state", getRobotState);

router.post("/robot/command", sendRobotCommand);

router.post("/internals/telemetry", saveTelemetry);

router.get("/robots/:id/status", getRobotState);

router.post("/robots/:id/commands", addRobotCommand);

router.get("/internals/robots/:id/commands", fetchAndClearCommands);

export default router;
