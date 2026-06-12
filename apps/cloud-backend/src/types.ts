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

type CommandType =
  | "MOVE_FORWARD"
  | "MOVE_BACKWARD"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "STOP";

type CommandStatus = "PENDING" | "EXECUTED";

export interface RobotCommand {
  command_id: string;
  command: CommandType;
  status: CommandStatus;
  timestamp: string;
}
