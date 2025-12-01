"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Send, Bot, User, BrainCircuit } from "lucide-react";
import { chatWithBusinessAdvisor } from "@/app/store/dashboard/actions";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "model";
    text: string;
}

export function AiInsightsWidget() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "I am your Business Advisor. I have access to your sales data. How can I assist with your planning today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const result = await chatWithBusinessAdvisor(history, userMessage);

            if (result.success && result.response) {
                setMessages(prev => [...prev, { role: "model", text: result.response }]);
            } else {
                setMessages(prev => [...prev, { role: "model", text: "Error: Unable to process request." }]);
            }
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: "model", text: "System Error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="xl:col-span-3 border-slate-200 flex flex-col h-[600px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b">
                <div>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <BrainCircuit className="w-5 h-5 text-slate-600" />
                        Business Advisor
                    </CardTitle>
                    <CardDescription>
                        Strategic planning and data analysis.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col bg-slate-50/30">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-4 max-w-3xl mx-auto w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role === "model" && (
                                    <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                                        <BrainCircuit className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className={cn(
                                    "rounded-md p-4 text-sm leading-relaxed shadow-sm max-w-[85%]",
                                    m.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-slate-200 text-slate-800"
                                )}>
                                    {m.role === "model" ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        m.text
                                    )}
                                </div>
                                {m.role === "user" && (
                                    <div className="w-8 h-8 rounded-sm bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-5 h-5 text-blue-700" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4 max-w-3xl mx-auto w-full justify-start">
                                <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center shrink-0">
                                    <BrainCircuit className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                    <span className="text-xs text-slate-500 font-medium">Analyzing data...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-white">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-3xl mx-auto">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for a plan or market analysis..."
                                className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-slate-900 hover:bg-slate-800">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
