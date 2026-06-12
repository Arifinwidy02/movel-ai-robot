// Dummy Database

export interface RobotData {
  robot_id: string;
  position: {
    x: number;
    y: number;
  };
  battery_percentage: number;
  timestamp: string;
}

export interface RobotData {
  robot_id: string;
  position: { x: number; y: number };
  battery_percentage: number;
  timestamp: string;
}

export interface RobotCommand {
  command_id: string;
  command:
    | "MOVE_FORWARD"
    | "MOVE_BACKWARD"
    | "TURN_LEFT"
    | "TURN_RIGHT"
    | "STOP";
  status: "PENDING" | "EXECUTED";
  timestamp: string;
}

export const robotStorage = new Map<string, RobotData>();

robotStorage.set("robot-1", {
  robot_id: "robot-1",
  position: { x: 0.0, y: 0.0 },
  battery_percentage: 100.0,
  timestamp: new Date().toISOString(),
});

export const commandQueueStorage = new Map<string, RobotCommand[]>();

commandQueueStorage.set("robot-1", []);
