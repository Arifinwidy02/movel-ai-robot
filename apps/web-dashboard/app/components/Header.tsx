import { Bot } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center gap-3 mb-6">
      <Bot className="w-8 h-8 text-blue-500" />
      <h1 className="text-xl font-bold tracking-wider uppercase text-slate-200">
        Robot Dashboard
      </h1>
    </header>
  );
}
