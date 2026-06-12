"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RobotTelemetry } from "./types";

import Header from "./components/Header";
import TelemetryPanel from "./components/TelemetryPanel";
import RobotViewer from "./components/RobotViewer";
import VirtualKeyboard from "./components/VirtualKeyboard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function RobotDashboard() {
  const [robotId, setRobotId] = useState<string>("robot-1");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<RobotTelemetry>({
    robot_id: "robot-1",
    position: { x: 0.0, y: 0.0 },
    battery_percentage: 100,
    timestamp: new Date().toISOString(),
  });

  const robotIdRef = useRef(robotId);
  const staleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    robotIdRef.current = robotId;
  }, [robotId]);

  useEffect(() => {
    const fetchInitialState = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/robot/state`);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data awal: ${response.statusText}`);
        }
        const data = await response.json();

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

  const sendCommand = async (action: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/robot/command`, {
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

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL);

    const resetStaleTimer = () => {
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }

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
        resetStaleTimer();
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setPressedKey(key);
        sendCommand(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setPressedKey(null);
        sendCommand("STOP");
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1 mb-6">
            <div className="md:col-span-4">
              <TelemetryPanel
                robotId={robotId}
                setRobotId={setRobotId}
                telemetry={telemetry}
                isOnline={isOnline}
              />
            </div>
            <div className="md:col-span-8">
              <RobotViewer />
            </div>
          </div>

          <VirtualKeyboard pressedKey={pressedKey} />
        </>
      )}
    </main>
  );
}
