import { type Request, type Response } from "express";
import {
  commandQueueStorage,
  robotStorage,
  // type RobotCommand,
  // type RobotData,
} from "../state/robotState";
import { io } from "../server";
import type { RobotCommand, RobotData } from "../types";

export const saveTelemetry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { robot_id, position, battery_percentage, timestamp } = req.body;
    // Validasi sederhana memastikan data tidak kosong
    if (!robot_id || !position) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const updatedData: RobotData = {
      robot_id,
      position: {
        x: Number(position.x) || 0.0,
        y: Number(position.y) || 0.0,
      },
      battery_percentage: Number(battery_percentage) || 0.0,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Simpan/Overwrite data di dalam RAM memory
    robotStorage.set(robot_id, updatedData);
    io.emit("telemetry_update", updatedData);
    res
      .status(200)
      .json({ success: true, message: "Telemetry updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRobotStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Invalid or missing Robot ID" });
      return;
    }

    const robot = robotStorage.get(id);
    if (!robot) {
      res.status(404).json({ success: false, message: "Robot not found" });
      return;
    }
    res.status(200).json({ success: true, data: robot });
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
    console.log("🚀 ~ addRobotCommand ~ req:", req);
    const { command } = req.body;
    const validCommands = [
      "MOVE_FORWARD",
      "MOVE_BACKWARD",
      "TURN_LEFT",
      "TURN_RIGHT",
      "STOP",
    ];

    if (
      !id ||
      typeof id !== "string" ||
      !validCommands.includes(command) ||
      !command
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid robot ID or unsupportted movement command",
      });
      return;
    }
    const newCommand: RobotCommand = {
      command_id: `cmd-${Math.random().toString(36).substr(2, 9)}`,
      command: command as any,
      status: "PENDING",
      timestamp: new Date().toISOString(),
    };
    // Get the old queue
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

    // Kosongkan antrean setelah diambil oleh plugin
    commandQueueStorage.set(id, []);

    res.status(200).json({
      success: true,
      commands: pendingCommands,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
