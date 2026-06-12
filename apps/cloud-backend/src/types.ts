export interface RobotData {
  robot_id: string;
  position: {
    x: number;
    y: number;
  };
  battery_percentage: number;
  timestamp: string;
}

export type CommandType = "w" | "a" | "s" | "d" | "STOP";

export type CommandStatus = "PENDING" | "EXECUTED";

export interface RobotCommand {
  command_id: string;
  command: CommandType;
  status: CommandStatus;
  timestamp: string;
}
