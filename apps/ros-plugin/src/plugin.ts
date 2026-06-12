import * as ROSLIB from "roslib";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ROS_BRIDGE_URL = process.env.ROS_BRIDGE_URL || "ws://localhost:9090";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const MAX_RETRY_DELAY_MS = 30000;
const INITIAL_RETRY_DELAY_MS = 1000;

console.log("🤖 ROS Plugin sedang menginisialisasi dengan Bun...");

let currentPosition = { x: 0, y: 0 };
let currentBattery = 100.0;
let isConnected = false;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let ros: ROSLIB.Ros | null = null;
let cmdTopic: ROSLIB.Topic | null = null;

function getRetryDelay(): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
    MAX_RETRY_DELAY_MS,
  );
  return delay + Math.random() * 1000;
}

function cleanup() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function connectToRosBridge() {
  cleanup();

  if (isConnected) return;

  console.log(
    `🔌 [ROS] Mencoba menghubungkan ke ${ROS_BRIDGE_URL} (percobaan ke-${retryCount + 1})...`,
  );

  ros = new ROSLIB.Ros({ url: ROS_BRIDGE_URL });

  ros.on("connection", () => {
    isConnected = true;
    retryCount = 0;
    console.log("✅ [ROS] Berhasil terhubung ke ROS Simulation Server!");
    setupSubscribers();
  });

  ros.on("error", (error) => {
    console.error("❌ [ROS] Terjadi error pada koneksi ROS Bridge:", error);
  });

  ros.on("close", () => {
    if (isConnected) {
      isConnected = false;
      console.warn("⚠️ [ROS] Koneksi terputus. Mencoba menyambung kembali...");
      scheduleRetry();
    } else {
      scheduleRetry();
    }
  });
}

function scheduleRetry() {
  if (isConnected) return;

  retryCount++;
  const delay = getRetryDelay();
  console.log(
    `⏳ [ROS] Menjadwalkan koneksi ulang dalam ${(delay / 1000).toFixed(1)} detik...`,
  );

  retryTimer = setTimeout(() => {
    connectToRosBridge();
  }, delay);
}

function setupSubscribers() {
  if (!ros || !isConnected) return;

  const poseListener = new ROSLIB.Topic({
    ros: ros,
    name: "/pose",
    messageType: "geometry_msgs/Point",
  });

  poseListener.subscribe((message: any) => {
    console.log("📥 [RAW POSE MESSAGE]:", message);
    if (message) {
      if (message.position) {
        currentPosition.x = message.position.x ?? 0.0;
        currentPosition.y = message.position.y ?? 0.0;
      } else {
        currentPosition.x = message.x ?? 0.0;
        currentPosition.y = message.y ?? 0.0;
      }
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

  cmdTopic = new ROSLIB.Topic({
    ros: ros,
    name: "/cmd",
    messageType: "std_msgs/String",
  });

  console.log("📡 [ROS] Subscribers untuk /pose, /battery_percentage, /cmd siap.");
}

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
          console.log(`📥 [PLUGIN] Menerima perintah: ${cmd.command}`);
          publishMoveCommand(cmd.command);
        });
      }
    }
  } catch (error: any) {
    console.log("🚀 ~ fetchCommandsFromCloud ~ error:", error);
  }
}

setInterval(fetchCommandsFromCloud, 500);

function publishMoveCommand(command: string) {
  if (!cmdTopic) {
    console.warn("⚠️ [ROS] cmdTopic belum siap, perintah diabaikan:", command);
    return;
  }
  const message = { data: command };
  cmdTopic.publish(message as any);
  console.log(`🤖 [ROS PUBLISH] Perintah '${command}' dikirim ke /cmd`);
}

connectToRosBridge();

const initialTimeoutTimer = setTimeout(() => {
  if (!isConnected) {
    console.warn(
      "⏳ [TIMEOUT] Koneksi awal ke ROS Bridge belum berhasil dalam 5 detik. Retry otomatis berjalan...",
    );
  }
}, 5000);

process.on("SIGTERM", () => {
  clearTimeout(initialTimeoutTimer);
  cleanup();
  process.exit(0);
});

process.on("SIGINT", () => {
  clearTimeout(initialTimeoutTimer);
  cleanup();
  process.exit(0);
});
