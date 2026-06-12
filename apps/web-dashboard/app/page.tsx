"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RobotTelemetry } from "./types";

import Header from "./components/Header";
import TelemetryPanel from "./components/TelemetryPanel";
import RobotViewer from "./components/RobotViewer";
import VirtualKeyboard from "./components/VirtualKeyboard";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const S = {
  main: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#f1f5f9",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  loadingWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    gap: "8px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #3b82f6",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
  },
  errorWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    color: "#f87171",
    padding: "16px",
    textAlign: "center" as const,
  },
  errorTitle: {
    fontWeight: 600,
    fontSize: "18px",
  },
  errorDetail: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
    maxWidth: "448px",
  },
  contentGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "24px",
    alignItems: "stretch",
    flex: 1,
    marginBottom: "24px",
  },
  leftPanel: {
    flex: "1 1 300px",
    minWidth: "280px",
  },
  rightPanel: {
    flex: "2 1 500px",
    minWidth: "350px",
  },
} as const;

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
  const staleRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    socket.on("connect", () => {
      setIsOnline(true);
      clearTimeout(staleRef.current);
      staleRef.current = setTimeout(() => setIsOnline(false), 5000);
    });

    socket.on("telemetry_update", (data: RobotTelemetry) => {
      const incomingRobotId = data.robot_id;
      if (incomingRobotId === robotId) {
        setTelemetry(data);
        setIsOnline(true);
        clearTimeout(staleRef.current);
        staleRef.current = setTimeout(() => setIsOnline(false), 5000);
      }
    });

    socket.on("disconnect", () => {
      setIsOnline(false);
      clearTimeout(staleRef.current);
    });

    return () => {
      socket.disconnect();
      clearTimeout(staleRef.current);
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
    <main style={S.main}>
      <Header />

      {isLoading ? (
        <div style={S.loadingWrap}>
          <div style={S.spinner}></div>
          <p style={S.loadingText}>Menghubungkan ke sistem robotik...</p>
        </div>
      ) : error ? (
        <div style={S.errorWrap}>
          <p style={S.errorTitle}>⚠️ Gangguan Koneksi API</p>
          <p style={S.errorDetail}>{error}</p>
        </div>
      ) : (
        <>
          <div style={S.contentGrid}>
            <div style={S.leftPanel}>
              <TelemetryPanel
                robotId={robotId}
                setRobotId={setRobotId}
                telemetry={telemetry}
                isOnline={isOnline}
              />
            </div>
            <div style={S.rightPanel}>
              <RobotViewer telemetry={telemetry} />
            </div>
          </div>

          <VirtualKeyboard pressedKey={pressedKey} />
        </>
      )}
    </main>
  );
}
