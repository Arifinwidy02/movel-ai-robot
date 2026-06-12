interface VirtualKeyboardProps {
  pressedKey: string | null;
}

const KEY_STYLE = {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },
  wide: {
    width: "56px",
    height: "40px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },
  wide16: {
    width: "64px",
    height: "40px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },
  wide20: {
    width: "80px",
    height: "40px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.1s",
  },
  footer: {
    backgroundColor: "#111726",
    border: "1px solid rgba(30,41,59,0.8)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  },
  wrap: {
    maxWidth: "896px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    userSelect: "none" as const,
  },
  row: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    width: "100%",
  },
  muted: {
    backgroundColor: "#1e293b",
    color: "#64748b",
    border: "1px solid rgba(51,65,85,0.5)",
  },
  wasdActive: {
    backgroundColor: "#4ade80",
    color: "#020617",
    transform: "scale(0.95)",
    boxShadow: "0 4px 6px -1px rgba(74,222,128,0.4)",
  },
  wasdInactive: {
    backgroundColor: "#16a34a",
    color: "#0f172a",
    fontWeight: 700,
    boxShadow: "0 10px 15px -3px rgba(22,163,74,0.2)",
  },
} as const;

export default function VirtualKeyboard({ pressedKey }: VirtualKeyboardProps) {
  const getKeyStyle = (key: string): React.CSSProperties => {
    const isTarget = ["w", "a", "s", "d"].includes(key);
    if (isTarget) {
      return pressedKey === key
        ? { ...KEY_STYLE.wasdActive }
        : { ...KEY_STYLE.wasdInactive };
    }
    return { ...KEY_STYLE.muted };
  };

  return (
    <footer style={KEY_STYLE.footer}>
      <div style={KEY_STYLE.wrap}>
        <div style={KEY_STYLE.row}>
          {["esc","1","2","3","4","5","6","7","8","9","0","-","=","back"].map((k) => (
            <div
              key={k}
              style={{
                ...(k === "back" || k === "esc" ? KEY_STYLE.wide : KEY_STYLE.base),
                ...getKeyStyle(k),
              }}
            >
              {k}
            </div>
          ))}
        </div>

        <div style={KEY_STYLE.row}>
          <div style={{ ...KEY_STYLE.wide, ...KEY_STYLE.muted }}>tab</div>
          {["q","w","e","r","t","y","u","i","o","p","[","]","\\"].map((k) => (
            <div key={k} style={{ ...KEY_STYLE.base, ...getKeyStyle(k) }}>
              {k}
            </div>
          ))}
        </div>

        <div style={KEY_STYLE.row}>
          <div style={{ ...KEY_STYLE.wide16, ...KEY_STYLE.muted }}>caps</div>
          {["a","s","d","f","g","h","j","k","l",";","'","enter"].map((k) => (
            <div
              key={k}
              style={{
                ...(k === "enter" ? KEY_STYLE.wide16 : KEY_STYLE.base),
                ...getKeyStyle(k),
              }}
            >
              {k}
            </div>
          ))}
        </div>

        <div style={KEY_STYLE.row}>
          <div style={{ ...KEY_STYLE.wide20, ...KEY_STYLE.muted }}>shift</div>
          {["z","x","c","v","b","n","m",",",".","/"].map((k) => (
            <div key={k} style={{ ...KEY_STYLE.base, ...getKeyStyle(k) }}>
              {k}
            </div>
          ))}
          <div style={{ ...KEY_STYLE.wide20, ...KEY_STYLE.muted }}>shift</div>
        </div>
      </div>
    </footer>
  );
}
