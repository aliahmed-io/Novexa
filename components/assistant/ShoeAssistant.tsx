"use client";

import { useEffect, useRef, useState } from "react";
import type { AssistantMode } from "@/lib/assistantTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODE: AssistantMode = "basic";

export function ShoeAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>(DEFAULT_MODE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, mode }),
      });

      const data = await res.json();

      const assistantText: string = typeof data?.content === "string"
        ? data.content
        : "I had trouble generating a response. Please try again.";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I couldn’t reach the Novexa shoe expert right now. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      {/* Floating trigger button bottom-left */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Open Novexa shoe expert chat"
        >
          <span className="text-lg font-semibold">AI</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 z-40 w-full max-w-md md:max-w-lg">
          <div className="rounded-2xl border bg-background shadow-lg flex flex-col h-[480px] overflow-hidden">
            <header className="px-4 py-3 border-b flex items-center justify-between bg-muted/60">
              <div>
                <p className="text-sm font-semibold">Novexa Shoe Expert</p>
                <p className="text-xs text-muted-foreground">
                  Get personalized shoe advice in {mode === "basic" ? "Basic" : "Advanced"} mode.
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-background px-1 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("basic")}
                  className={cn(
                    "px-2 py-1 rounded-full transition-colors",
                    mode === "basic" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  Basic
                </button>
                <button
                  type="button"
                  onClick={() => setMode("advanced")}
                  className={cn(
                    "px-2 py-1 rounded-full transition-colors",
                    mode === "advanced" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  Advanced
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="ml-2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-background to-muted/40"
            >
              {messages.length === 0 && (
                <div className="text-xs text-muted-foreground text-center mt-8">
                  <p className="font-medium mb-1">Hi, I’m your Novexa shoe expert.</p>
                  <p>
                    Tell me what you’re looking for — budget, color, gender, style, or any foot issues.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted text-foreground border"
                  )}
                >
                  {m.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto max-w-[70%] rounded-2xl px-3 py-2 text-xs bg-muted text-muted-foreground border">
                  Thinking about the best options for you…
                </div>
              )}
            </div>

            <form
              className="border-t px-3 py-2 flex items-center gap-2 bg-background"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about shoes, comfort, color, budget…"
                className="text-sm"
              />
              <Button type="submit" size="sm" disabled={loading || !input.trim()}>
                {loading ? "Sending" : "Send"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
