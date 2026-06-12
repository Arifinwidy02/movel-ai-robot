import { type Request, type Response } from "express";
import {
  commandQueueStorage,
  robotStorage,
  updateLastTelemetryAt,
  updatePluginStatus,
} from "../state/robotState";
import { io } from "../server";
import type { RobotCommand, RobotData } from "../types";

export const saveTelemetry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { robot_id, position, battery_percentage, timestamp } = req.body;

    if (!robot_id || !position) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const ts = timestamp || new Date().toISOString();

    const updatedData: RobotData = {
      robot_id,
      position: {
        x: Number(position.x) || 0.0,
        y: Number(position.y) || 0.0,
      },
      battery_percentage: Number(battery_percentage) || 0.0,
      timestamp: ts,
    };

    robotStorage.set(robot_id, updatedData);
    updateLastTelemetryAt(ts);
    updatePluginStatus(true);
    io.emit("telemetry_update", updatedData);
    res
      .status(200)
      .json({ success: true, message: "Telemetry updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRobotState = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = (req.params.id as string) || "robot-1";
    const robot = robotStorage.get(id);
    if (!robot) {
      res.status(404).json({ success: false, message: "Robot not found" });
      return;
    }
    if (req.params.id) {
      res.status(200).json({ success: true, data: robot });
    } else {
      res.status(200).json(robot);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addRobotCommand = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { command } = req.body;
    const validCommands = ["w", "a", "s", "d", "STOP"];

    if (
      !id ||
      typeof id !== "string" ||
      !validCommands.includes(command) ||
      !command
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid robot ID or unsupported movement command. Allowed: w, a, s, d, STOP",
      });
      return;
    }

    const newCommand: RobotCommand = {
      command_id: `cmd-${Math.random().toString(36).substr(2, 9)}`,
      command,
      status: "PENDING",
      timestamp: new Date().toISOString(),
    };

    const currentQueue = commandQueueStorage.get(id) || [];
    currentQueue.push(newCommand);
    commandQueueStorage.set(id, currentQueue);
    console.log(
      `📥 [COMMAND RECEIVED] Perintah '${command}' dimasukkan ke antrean ${id}`,
    );

    res.status(200).json({
      success: true,
      message: "Command queued successfully",
      data: newCommand,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendRobotCommand = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { command } = req.body;
    const validCommands = ["w", "a", "s", "d", "STOP"];

    if (!command || !validCommands.includes(command)) {
      res.status(400).json({
        success: false,
        message: "Invalid command. Allowed: w, a, s, d, STOP",
      });
      return;
    }

    const newCommand: RobotCommand = {
      command_id: `cmd-${Math.random().toString(36).substr(2, 9)}`,
      command,
      status: "PENDING",
      timestamp: new Date().toISOString(),
    };

    const currentQueue = commandQueueStorage.get("robot-1") || [];
    currentQueue.push(newCommand);
    commandQueueStorage.set("robot-1", currentQueue);
    console.log(
      `📥 [COMMAND RECEIVED] Perintah '${command}' dimasukkan ke antrean robot-1`,
    );

    res.status(200).json({
      success: true,
      message: "Command queued successfully",
      data: newCommand,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fetchAndClearCommands = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, message: "Robot ID is required" });
      return;
    }

    const queue = commandQueueStorage.get(id) || [];
    const pendingCommands = queue.filter((cmd) => cmd.status === "PENDING");

    commandQueueStorage.set(id, []);

    res.status(200).json({
      success: true,
      commands: pendingCommands,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
