"use client";

import { useEffect, useRef, useState } from "react";
import type { AssistantMode, Product } from "@/lib/assistantTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, MessageCircle } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

const DEFAULT_MODE: AssistantMode = "basic";

function renderMessage(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className="min-h-[1.2em]">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
}

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
        products: data.products,
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
    <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-end p-6">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform"
            aria-label="Open Novexa shoe expert chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={{ left: -window.innerWidth + 400, right: 0, top: -window.innerHeight + 500, bottom: 0 }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-full max-w-md bg-background border rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden"
          >
            <header className="px-4 py-3 border-b flex items-center justify-between bg-muted/60 cursor-move">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold">Novexa Expert</p>
                  <p className="text-[10px] text-muted-foreground">
                    {mode === "basic" ? "Basic Mode" : "Advanced Mode"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMode(mode === "basic" ? "advanced" : "basic")}
                  className="text-[10px] px-2 py-1 rounded-full bg-background border hover:bg-accent transition-colors"
                >
                  Switch to {mode === "basic" ? "Advanced" : "Basic"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gradient-to-b from-background to-muted/20"
            >
              {messages.length === 0 && (
                <div className="text-center mt-10 space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-sm">Hi! I’m your shoe expert.</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Ask me about styles, colors, or specific needs. I can show you products directly!
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground border rounded-bl-none"
                    )}
                  >
                    {renderMessage(m.content)}
                  </div>

                  {/* Product Carousel */}
                  {m.products && m.products.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-full no-scrollbar">
                      {m.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                  </div>
                  Thinking...
                </div>
              )}
            </div>

            <form
              className="border-t p-3 bg-background flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="text-sm rounded-full bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="rounded-full h-10 w-10 shrink-0"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

