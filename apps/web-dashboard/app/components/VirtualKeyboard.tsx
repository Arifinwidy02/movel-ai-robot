interface VirtualKeyboardProps {
  pressedKey: string | null;
}

export default function VirtualKeyboard({ pressedKey }: VirtualKeyboardProps) {
  const getKeyStyle = (key: string) => {
    const isTarget = ["w", "a", "s", "d"].includes(key);
    if (isTarget) {
      return pressedKey === key
        ? "bg-green-400 text-slate-950 scale-95 shadow-md shadow-green-400/40"
        : "bg-green-600 text-slate-900 font-bold shadow-lg shadow-green-600/20";
    }
    return "bg-slate-800 text-slate-400 border border-slate-700/50";
  };

  return (
    <footer className="bg-[#111726] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wider select-none">
        {/* Row 1 */}
        <div className="flex gap-1 justify-center w-full">
          {[
            "esc",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "0",
            "-",
            "=",
            "back",
          ].map((k) => (
            <div
              key={k}
              className={`h-10 rounded flex items-center justify-center transition-all duration-100 ${k === "back" || k === "esc" ? "w-14" : "w-10"} ${getKeyStyle(k)}`}
            >
              {k}
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-1 justify-center w-full">
          <div className="w-14 h-10 rounded flex items-center justify-center bg-slate-800 text-slate-500 border border-slate-700/50">
            tab
          </div>
          {[
            "q",
            "w",
            "e",
            "r",
            "t",
            "y",
            "u",
            "i",
            "o",
            "p",
            "[",
            "]",
            "\\",
          ].map((k) => (
            <div
              key={k}
              className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-100 ${getKeyStyle(k)}`}
            >
              {k}
            </div>
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex gap-1 justify-center w-full">
          <div className="w-16 h-10 rounded flex items-center justify-center bg-slate-800 text-slate-500 border border-slate-700/50">
            caps
          </div>
          {["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"].map(
            (k) => (
              <div
                key={k}
                className={`h-10 rounded flex items-center justify-center transition-all duration-100 ${k === "enter" ? "w-16" : "w-10"} ${getKeyStyle(k)}`}
              >
                {k}
              </div>
            ),
          )}
        </div>

        {/* Row 4 */}
        <div className="flex gap-1 justify-center w-full">
          <div className="w-20 h-10 rounded flex items-center justify-center bg-slate-800 text-slate-500 border border-slate-700/50">
            shift
          </div>
          {["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"].map((k) => (
            <div
              key={k}
              className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-100 ${getKeyStyle(k)}`}
            >
              {k}
            </div>
          ))}
          <div className="w-20 h-10 rounded flex items-center justify-center bg-slate-800 text-slate-500 border border-slate-700/50">
            shift
          </div>
        </div>
      </div>
    </footer>
  );
}
