import * as ROSLIB from "roslib";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Configuration dari Env Variables (Wajib gunakan http:// untuk backend axios!)
const ROS_BRIDGE_URL = process.env.ROS_BRIDGE_URL || "ws://localhost:9090";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000"; // Ganti ws:// jadi http://

console.log("🤖 ROS Plugin sedang menginisialisasi dengan Bun...");

// 1. Hubungkan ke ROS Bridge via WebSocket
const ros = new ROSLIB.Ros({
  url: ROS_BRIDGE_URL,
});

// State internal penampung data sebelum ditembak ke Cloud Backend
let currentPosition = { x: 0, y: 0 };
let currentBattery = 100.0;

// --- TRACKING STATUS KONEKSI MANUAL ---
let isConnected = false;

const connectionTimeout = setTimeout(() => {
  if (!isConnected) {
    console.error(
      "⏳ [TIMEOUT] Wah, koneksi ke ROS Bridge nge-gantung lebih dari 5 detik!",
    );
    console.warn(
      "👉 Pastikan kamu sudah menambahkan 'ports: - \"9090:9090\"' dan mematikan 'network_mode: \"host\"' di file docker-compose-assignment.yaml, lalu merestart container simulatornya.",
    );
  }
}, 5000);

// Event Handling ROS Connection
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

// 2. Subscribe ke Topic /pose (Posisi Robot)
const postListener = new ROSLIB.Topic({
  ros: ros,
  name: "/pose",
  messageType: "geometry_msgs/Pose",
});

postListener.subscribe((message: any) => {
  // Sesuai spek dokumen: ambil x dan y dari message.position
  if (message && message.position) {
    currentPosition.x = message.position.x || 0.0;
    currentPosition.y = message.position.y || 0.0;
  }
  console.log(
    `📍 Mendapat koordinat baru: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}) -> Mencoba kirim ke cloud...`,
  );
  sendTelemetrytoCloud();
});

// 3. Subscribe ke Topic /battery_percentage (Baterai Robot)
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

// 4. Fungsi Kirim Telemetry ke Cloud Backend via Axios POST
async function sendTelemetrytoCloud() {
  // Samakan persis dengan struktur dokumen Movel AI Halaman 4
  const telemetryPayload = {
    robot_id: "robot-1",
    position: currentPosition,
    battery_percentage: currentBattery,
    timestamp: new Date().toISOString(),
  };

  try {
    // Kirim payload langsung tanpa dibungkus key 'telemetry' lagi
    await axios.post(
      `${BACKEND_URL}/api/internals/telemetry`,
      telemetryPayload,
    );
    console.log(`🚀 [CLOUD SYNC] Sukses setor data ke Cloud Backend!`);
  } catch (error: any) {
    console.error("❌ [CLOUD SYNC] Gagal kirim ke backend:", error.message);
  }
}

// --- 5. Fungsi Mengambil Perintah dari Cloud Backend (Command Polling) ---
async function fetchCommandsFromCloud() {
  try {
    const robotId = "robot-1";
    const response = await axios.get(
      `${BACKEND_URL}/api/internals/robots/${robotId}/commands`,
    );

    if (response.data && response.data.success) {
      const commands = response.data.commands;

      // Jika ada perintah baru di dalam array
      if (commands.length > 0) {
        commands.forEach((cmd: any) => {
          console.log(
            `📥 [PLUGIN] Menerima perintah pergerakan: ${cmd.command}`,
          );
          publishMoveCommand(cmd.command);
        });
      }
    }
  } catch (error: any) {
    // Kita matikan log eror berkala agar tidak membanjiri terminal jika server sempat restart
    // console.error("❌ [COMMAND SYNC] Gagal mengambil perintah:", error.message);
  }
}

// Jalankan pemeriksaan antrean secara berkala setiap 500ms
setInterval(fetchCommandsFromCloud, 500);

// --- 6. Publish Perintah ke Simulator Robot via ROS Bridge ---
// Definisikan Topik ROS untuk pergerakan (/cmd_vel)
const cmdVelTopic = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd_vel", // atau sesuaikan dengan nama topik di tugas simulator kamu (misal '/cmd')
  messageType: "geometry_msgs/Twist",
});

function publishMoveCommand(command: string) {
  // 1. Struktur dasar Twist Message untuk pergerakan linear dan angular
  let linearX = 0.0;
  let angularZ = 0.0;

  switch (command) {
    case "MOVE_FORWARD":
      linearX = 0.5; // Bergerak maju dengan kecepatan 0.5 m/s
      break;
    case "MOVE_BACKWARD":
      linearX = -0.5; // Bergerak mundur
      break;
    case "TURN_LEFT":
      angularZ = 1.0; // Berputar ke kiri (positif)
      break;
    case "TURN_RIGHT":
      angularZ = -1.0; // Berputar ke kanan (negatif)
      break;
    case "STOP":
      linearX = 0.0;
      angularZ = 0.0; // Berhenti total
      break;
  }

  // 2. LANGSUNG BUAT JADI PLAIN OBJECT (Tanpa 'new ROSLIB.Message')
  const twistMessage = {
    linear: { x: linearX, y: 0.0, z: 0.0 },
    angular: { x: 0.0, y: 0.0, z: angularZ },
  };

  // 3. Tembakkan langsung ke robot simulator!
  cmdVelTopic.publish(twistMessage as any); // Gunakan 'as any' jika definisi tipe data roslib kaku
  console.log(
    `🤖 [ROS PUBLISH] Berhasil mengirim instruksi Twist ke robot: Twist(linear.x=${linearX}, angular.z=${angularZ})`,
  );
}
