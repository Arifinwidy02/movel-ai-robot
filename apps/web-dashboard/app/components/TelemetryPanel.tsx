import { Battery, MapPin, Bot, Info, RefreshCw } from "lucide-react";
import { RobotTelemetry } from "../types";

interface TelemetryPanelProps {
  robotId: string;
  setRobotId: (id: string) => void;
  telemetry: RobotTelemetry;
  isOnline: boolean;
}

const S = {
  section: {
    backgroundColor: "#111726",
    border: "1px solid rgba(30,41,59,0.8)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    gap: "16px",
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    height: "100%",
    boxSizing: "border-box" as const,
  },
  selectorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "24px",
    backgroundColor: "rgba(15,23,42,0.5)",
    padding: "8px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  select: {
    backgroundColor: "transparent",
    fontSize: "14px",
    fontWeight: 600,
    padding: "4px 8px",
    outline: "none",
    cursor: "pointer",
    color: "#cbd5e1",
    width: "100%",
    border: "none",
  },
  option: {
    backgroundColor: "#111726",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)",
    whiteSpace: "nowrap" as const,
    transition: "background-color 0.15s",
  },
  cardsWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "rgba(15,23,42,0.3)",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(30,41,59,0.4)",
  },
  iconBox: (color: string, bgAlpha: string) => ({
    padding: "10px",
    backgroundColor: bgAlpha,
    borderRadius: "12px",
    color,
  }),
  cardLabel: {
    fontSize: "10px",
    textTransform: "uppercase" as const,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#64748b",
  },
  batteryRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  batteryValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#4ade80",
  },
  barBg: {
    width: "100%",
    backgroundColor: "#1e293b",
    height: "8px",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  barFill: (pct: number) => ({
    backgroundColor: "#22c55e",
    height: "100%",
    transition: "width 0.3s",
    borderRadius: "9999px",
    width: `${pct}%`,
  }),
  posRow: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#cbd5e1",
  },
  posVal: {
    color: "#60a5fa",
    fontFamily: "monospace",
  },
  robotLabel: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#cbd5e1",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(30,41,59,0.6)",
    paddingTop: "12px",
    fontSize: "12px",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
  },
  statusText: (online: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
    color: online ? "#4ade80" : "#f87171",
  }),
  statusDot: (online: boolean) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: online ? "#4ade80" : "#f87171",
    animation: online ? "pulse 2s infinite" : "none",
  }),
} as const;

export default function TelemetryPanel({
  robotId,
  setRobotId,
  telemetry,
  isOnline,
}: TelemetryPanelProps) {
  return (
    <section style={S.section}>
      <div>
        <div style={S.selectorRow}>
          <select
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
            style={S.select}
          >
            <option value="robot-1" style={S.option}>
              ROBOT-01
            </option>
            <option value="robot-2" style={S.option}>
              ROBOT-02
            </option>
          </select>
          <button style={S.button}>
            <RefreshCw size={14} /> GANTI ID
          </button>
        </div>

        <div style={S.cardsWrap}>
          <div style={S.card}>
            <div style={S.iconBox("#22c55e", "rgba(34,197,94,0.1)")}>
              <Battery size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={S.cardLabel}>Battery Health</p>
              <div style={S.batteryRow}>
                <span style={S.batteryValue}>
                  {telemetry.battery_percentage}%
                </span>
                <div style={S.barBg}>
                  <div style={S.barFill(telemetry.battery_percentage)}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.iconBox("#3b82f6", "rgba(59,130,246,0.1)")}>
              <MapPin size={20} />
            </div>
            <div>
              <p style={S.cardLabel}>Posisi</p>
              <p style={S.posRow}>
                X:{" "}
                <span style={S.posVal}>{telemetry.position.x.toFixed(2)}m</span>
                &nbsp;&nbsp;Y:{" "}
                <span style={S.posVal}>{telemetry.position.y.toFixed(2)}m</span>
              </p>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.iconBox("#a855f7", "rgba(168,85,247,0.1)")}>
              <Bot size={20} />
            </div>
            <div>
              <p style={S.cardLabel}>Nama Robot</p>
              <p style={S.robotLabel}>Explorer Bot ({robotId})</p>
            </div>
          </div>
        </div>
      </div>

      <div style={S.footer}>
        <div style={S.footerLeft}>
          <Info size={16} color="#64748b" /> <span>Status</span>
        </div>
        <span style={S.statusText(isOnline)}>
          {isOnline ? "Online" : "Offline"}
          <span style={S.statusDot(isOnline)}></span>
        </span>
      </div>
    </section>
  );
}
