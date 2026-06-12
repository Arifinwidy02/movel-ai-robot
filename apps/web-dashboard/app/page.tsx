"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RobotTelemetry } from "./types";

// Import Komponen SOLID
import Header from "./components/Header";
import TelemetryPanel from "./components/TelemetryPanel";
import RobotViewer from "./components/RobotViewer";
import VirtualKeyboard from "./components/VirtualKeyboard";

export default function RobotDashboard() {
  const [robotId, setRobotId] = useState<string>("robot-1");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Untuk loading state awal
  const [error, setError] = useState<string | null>(null); // Untuk error state kegagalan API
  const [telemetry, setTelemetry] = useState<RobotTelemetry>({
    robot_id: "robot-1",
    position: { x: 0.0, y: 0.0 },
    battery_percentage: 100,
    timestamp: new Date().toISOString(),
  });

  // Gunakan useRef untuk mengunci nilai robotId agar terhindar dari closure issue di listener
  const robotIdRef = useRef(robotId);
  const staleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronkan isi ref tiap kali state robotId berubah
  useEffect(() => {
    robotIdRef.current = robotId;
  }, [robotId]);

  // --- 1. INITIAL STATE FETCHING (GET /api/robot/state) ---
  useEffect(() => {
    const fetchInitialState = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Endpoint disesuaikan dengan requirement PDF halaman 4
        const response = await fetch("http://localhost:4000/api/robot/state");
        if (!response.ok) {
          throw new Error(`Gagal mengambil data awal: ${response.statusText}`);
        }
        const data = await response.json();

        // Pastikan struktur data sesuai sebelum dipasang ke state
        if (data) {
          setTelemetry({
            robot_id: data.robot_id || robotId,
            position: data.position || { x: 0.0, y: 0.0 },
            battery_percentage: data.battery_percentage ?? 100,
            timestamp: data.timestamp || new Date().toISOString(),
          });
          setIsOnline(true);
        }
      } catch (err: any) {
        console.error("❌ Error fetch initial state:", err);
        setError(err.message || "Gagal tersambung ke server.");
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [robotId]);

  // --- 2. API COMMAND SENDER (POST /api/robot/command) ---
  const sendCommand = async (action: string) => {
    const targetRobotId = robotIdRef.current;
    try {
      // Menembak endpoint command sesuai dengan mandat requirement PDF halaman 4
      const response = await fetch("http://localhost:4000/api/robot/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: action }),
      });

      if (!response.ok) {
        console.error(
          `Gagal mengirim perintah: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Error saat menembak API Command:", error);
    }
  };

  // --- 3. WEBSOCKET LOGIC & STALE HANDLING (5 SECONDS TIMEOUT) ---
  useEffect(() => {
    const socket: Socket = io("http://localhost:4000");

    // Fungsi pembantu untuk me-reset detektor stale (heartbeat) tiap kali data masuk
    const resetStaleTimer = () => {
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }

      // Sesuai requirement halaman 5: Tandai stale jika tidak ada update selama 5 detik
      staleTimerRef.current = setTimeout(() => {
        console.warn("⚠️ Telemetri robot terputus/stale lebih dari 5 detik!");
        setIsOnline(false);
      }, 5000);
    };

    socket.on("connect", () => {
      setIsOnline(true);
      resetStaleTimer();
    });

    socket.on("telemetry_update", (data: RobotTelemetry) => {
      const incomingRobotId = data.robot_id;
      if (incomingRobotId === robotId) {
        setTelemetry(data);
        setIsOnline(true);
        resetStaleTimer(); // Segarkan kembali timer setiap kali mendapat broadcast data
      }
    });

    socket.on("disconnect", () => {
      setIsOnline(false);
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    });

    return () => {
      socket.disconnect();
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, [robotId]);

  // --- 4. PHYSICAL KEYBOARD LISTENERS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setPressedKey(key);
        sendCommand(key); // Kirim w, a, s, d langsung berformat huruf kecil
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setPressedKey(null);
        sendCommand("STOP"); // Menghentikan robot saat tombol dilepas
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 flex flex-col justify-between font-sans">
      <Header />

      {/* Menampilkan Loading State atau Error State sesuai kriteria halaman 5 */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Menghubungkan ke sistem robotik...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-400 p-4 text-center">
          <p className="font-semibold text-lg">⚠️ Gangguan Koneksi API</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">{error}</p>
        </div>
      ) : (
        <>
          {/* TOP REGION */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1 mb-6">
            <div className="md:col-span-4">
              <TelemetryPanel
                robotId={robotId}
                setRobotId={setRobotId}
                telemetry={telemetry}
                isOnline={isOnline} // State ini otomatis berubah redup/stale jika terputus 5 detik
              />
            </div>
            <div className="md:col-span-8">
              <RobotViewer />
            </div>
          </div>

          {/* BOTTOM REGION */}
          <VirtualKeyboard pressedKey={pressedKey} />
        </>
      )}
    </main>
  );
}
