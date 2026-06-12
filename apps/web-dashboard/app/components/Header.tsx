import { Bot } from "lucide-react";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <Bot size={32} color="#3b82f6" />
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "#e2e8f0",
        }}
      >
        Robot Dashboard
      </h1>
    </header>
  );
}
