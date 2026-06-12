import * as ROSLIB from "roslib";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ROS_BRIDGE_URL = process.env.ROS_BRIDGE_URL || "ws://localhost:9090";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

console.log("🤖 ROS Plugin sedang menginisialisasi dengan Bun...");

const ros = new ROSLIB.Ros({
  url: ROS_BRIDGE_URL,
});

let currentPosition = { x: 0, y: 0 };
let currentBattery = 100.0;

let isConnected = false;

const connectionTimeout = setTimeout(() => {
  if (!isConnected) {
    console.error(
      "⏳ [TIMEOUT] Koneksi ke ROS Bridge tidak terjawab lebih dari 5 detik!",
    );
    console.warn(
      "👉 Pastikan simulator ROS sudah berjalan dan port 9090 terbuka.",
    );
  }
}, 5000);

ros.on("connection", () => {
  isConnected = true;
  clearTimeout(connectionTimeout);
  console.log("✅ [ROS] Berhasil terhubung ke ROS Simulation Server!");
});

ros.on("error", (error) => {
  console.error("❌ [ROS] Terjadi error pada koneksi ROS Bridge:", error);
});

ros.on("close", () => {
  console.warn("⚠️ [ROS] Koneksi terputus. Mencoba menyambung kembali...");
});

const poseListener = new ROSLIB.Topic({
  ros: ros,
  name: "/pose",
  messageType: "geometry_msgs/Pose",
});

poseListener.subscribe((message: any) => {
  if (message && message.position) {
    currentPosition.x = message.position.x || 0.0;
    currentPosition.y = message.position.y || 0.0;
  }
  console.log(
    `📍 Koordinat: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)})`,
  );
  sendTelemetrytoCloud();
});

const batteryListener = new ROSLIB.Topic({
  ros: ros,
  name: "/battery_percentage",
  messageType: "std_msgs/Float32",
});

batteryListener.subscribe((message: any) => {
  if (message && message.data !== undefined) {
    currentBattery = message.data;
  }
});

async function sendTelemetrytoCloud() {
  const telemetryPayload = {
    robot_id: "robot-1",
    position: currentPosition,
    battery_percentage: currentBattery,
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(
      `${BACKEND_URL}/api/internals/telemetry`,
      telemetryPayload,
    );
    console.log(`🚀 [CLOUD SYNC] Sukses setor data ke Cloud Backend!`);
  } catch (error: any) {
    console.error("❌ [CLOUD SYNC] Gagal kirim ke backend:", error.message);
  }
}

async function fetchCommandsFromCloud() {
  try {
    const robotId = "robot-1";
    const response = await axios.get(
      `${BACKEND_URL}/api/internals/robots/${robotId}/commands`,
    );

    if (response.data && response.data.success) {
      const commands = response.data.commands;

      if (commands.length > 0) {
        commands.forEach((cmd: any) => {
          console.log(
            `📥 [PLUGIN] Menerima perintah: ${cmd.command}`,
          );
          publishMoveCommand(cmd.command);
        });
      }
    }
  } catch (error: any) {
    /* silent fail — backend mungkin sedang restart */
  }
}

setInterval(fetchCommandsFromCloud, 500);

const cmdTopic = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd",
  messageType: "std_msgs/String",
});

function publishMoveCommand(command: string) {
  const message = { data: command };
  cmdTopic.publish(message as any);
  console.log(
    `🤖 [ROS PUBLISH] Perintah '${command}' dikirim ke /cmd`,
  );
}
