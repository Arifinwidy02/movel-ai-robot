export default function RobotViewer() {
  return (
    <section className="bg-[#111726] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-xl min-h-[300px] h-full">
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-bold text-green-400 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
        View
      </div>

      <div className="text-center opacity-60 flex flex-col items-center gap-4">
        <div className="w-48 h-48 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center text-slate-600 font-mono text-xs">
          [ Gambar/Mesh Robot ]
        </div>
        <p className="text-xs text-slate-500">
          Visualisasi 3D / Gambar Robot Muncul di Sini
        </p>
      </div>
    </section>
  );
}
