import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Send, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Praja Mitra" },
      { name: "description", content: "Chat with the Praja Mitra AI assistant to figure out where to file your complaint." },
    ],
  }),
  component: Assistant,
});

interface Msg { role: "user" | "assistant"; text: string }

function suggest(text: string): string {
  const t = text.toLowerCase();
  if (/water|pipe|tap|leak/.test(t))
    return "This looks like a Water Supply issue. I'd recommend filing under 'Water Supply' → 'Pipeline Leakage' or 'No Water Supply'.";
  if (/pothole|road|footpath/.test(t))
    return "This appears to be a Roads issue. Please file under 'Roads' → 'Potholes' with a photo of the location.";
  if (/garbage|trash|dump|bin/.test(t))
    return "This is a Sanitation issue. File under 'Garbage' → 'Garbage Not Collected' or 'Overflowing Bins'.";
  if (/light|electric|current|transformer/.test(t))
    return "This is an Electricity complaint. Try 'Electricity' → 'Power Cut' or 'Fallen Wire' if it's a hazard.";
  if (/school|teacher|mid.?day/.test(t))
    return "This is a School-related complaint. File under 'School' with the specific issue.";
  return "I can help route your complaint. Try describing the issue in one line — I'll suggest the right department.";
}

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Namaste 🙏 I'm the Praja Mitra AI Assistant. Describe your issue and I'll route it to the right department." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "assistant", text: suggest(q) }]);
    setInput("");
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 40);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Get instant guidance on where to file your complaint.</p>
        </div>
      </div>

      <Card className="flex h-[60vh] flex-col overflow-hidden shadow-card">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your issue…" />
          <Button type="submit"><Send className="h-4 w-4" /></Button>
        </form>
      </Card>
    </div>
  );
}