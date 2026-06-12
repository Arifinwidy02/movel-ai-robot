import { useEffect, useRef } from "react";
import { RobotTelemetry } from "../types";

interface RobotViewerProps {
  telemetry: RobotTelemetry;
}

const CANVAS_W = 600;
const CANVAS_H = 400;
const GRID_STEP = 40;
const DOT_R = 8;

export default function RobotViewer({ telemetry }: RobotViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#111726";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(30,41,59,0.5)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(59,130,246,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    const px = cx + telemetry.position.x * GRID_STEP;
    const py = cy - telemetry.position.y * GRID_STEP;

    ctx.beginPath();
    ctx.arc(px, py, DOT_R, 0, Math.PI * 2);
    ctx.fillStyle = "#4ade80";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "11px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`(${telemetry.position.x.toFixed(1)}, ${telemetry.position.y.toFixed(1)})`, px + 14, py - 6);
  }, [telemetry]);

  return (
    <section style={S.section}>
      <div style={S.badge}>
        <span style={S.badgeDot}></span> Position Tracker
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={S.canvas}
      />
    </section>
  );
}

const S = {
  section: {
    backgroundColor: "#111726",
    border: "1px solid rgba(30,41,59,0.8)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    position: "relative" as const,
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    minHeight: "300px",
    height: "100%",
    boxSizing: "border-box" as const,
  },
  badge: {
    position: "absolute" as const,
    top: "16px",
    left: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(15,23,42,0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "6px 12px",
    borderRadius: "9999px",
    border: "1px solid #1e293b",
    fontSize: "10px",
    fontWeight: 700,
    color: "#4ade80",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#4ade80",
    borderRadius: "50%",
  },
  canvas: {
    borderRadius: "12px",
    maxWidth: "100%",
    height: "auto",
  },
} as const;
