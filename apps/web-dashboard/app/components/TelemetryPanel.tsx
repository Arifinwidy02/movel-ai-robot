import { Battery, MapPin, Bot, Info, RefreshCw } from "lucide-react";
import { RobotTelemetry } from "../types";

interface TelemetryPanelProps {
  robotId: string;
  setRobotId: (id: string) => void;
  telemetry: RobotTelemetry;
  isOnline: boolean;
}

export default function TelemetryPanel({
  robotId,
  setRobotId,
  telemetry,
  isOnline,
}: TelemetryPanelProps) {
  return (
    <section className="bg-[#111726] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl h-full">
      <div>
        {/* ROBOT ID SELECTION */}
        <div className="flex items-center justify-between gap-3 mb-6 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <select
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
            className="bg-transparent text-sm font-semibold px-2 py-1 outline-none cursor-pointer text-slate-300 w-full"
          >
            <option value="robot-1" className="bg-[#111726]">
              ROBOT-01
            </option>
            <option value="robot-2" className="bg-[#111726]">
              ROBOT-02
            </option>
          </select>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 transition-all text-xs font-bold text-white px-3 py-2 rounded-lg shadow-md shadow-blue-600/20 whitespace-nowrap">
            <RefreshCw className="w-3.5 h-3.5" /> GANTI ID
          </button>
        </div>

        {/* TELEMETRY CARDS */}
        <div className="space-y-4">
          {/* BATTERY */}
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
            <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <Battery className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Battery Health
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-green-400">
                  {telemetry.battery_percentage}%
                </span>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${telemetry.battery_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* POSITION */}
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Posisi
              </p>
              <p className="text-sm font-bold text-slate-300">
                X:{" "}
                <span className="text-blue-400 font-mono">
                  {telemetry.position.x.toFixed(2)}m
                </span>{" "}
                &nbsp; Y:{" "}
                <span className="text-blue-400 font-mono">
                  {telemetry.position.y.toFixed(2)}m
                </span>
              </p>
            </div>
          </div>

          {/* NAME */}
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Nama Robot
              </p>
              <p className="text-sm font-bold text-slate-300">
                Explorer Bot ({robotId})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS FOOTER */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-slate-500" /> <span>Status</span>
        </div>
        <span
          className={`flex items-center gap-1.5 font-bold ${isOnline ? "text-green-400" : "text-red-400"}`}
        >
          {isOnline ? "Online" : "Offline"}
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
          ></span>
        </span>
      </div>
    </section>
  );
}
