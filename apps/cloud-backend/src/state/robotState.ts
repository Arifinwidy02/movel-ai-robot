// Dummy Database

import type { RobotCommand, RobotData } from "../types";

export const robotStorage = new Map<string, RobotData>();

robotStorage.set("robot-1", {
  robot_id: "robot-1",
  position: { x: 0.0, y: 0.0 },
  battery_percentage: 100.0,
  timestamp: new Date().toISOString(),
});

export const commandQueueStorage = new Map<string, RobotCommand[]>();

commandQueueStorage.set("robot-1", []);
