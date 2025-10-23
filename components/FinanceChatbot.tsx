"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};


export default function FinanceChatbot() {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi! I can analyze your spending, budgets, and answer finance questions. I can also help with investment ideas and financial insights. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstSent, setFirstSent] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canUse = useMemo(() => {
    // We now call our own API route; only require Clerk user
    return !!(isLoaded && user?.id);
  }, [isLoaded, user?.id]);

  const askServer = useCallback(async (query: string, history: ChatMessage[]) => {
    // Send compact recent history (last 10 messages excluding system greeting)
    const recent = history.slice(-10).map(m => ({ role: m.role, content: m.content })).filter(Boolean);
    const res = await fetch("/api/chatbot/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, history: recent }),
    });
    if (!res.ok) throw new Error("Request failed");
    const j = await res.json();
    return String(j.text || "");
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !canUse) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userText },
    ]);
    setLoading(true);

    try {
      // Include recent conversational context so the assistant can reference prior turns
      const answer = await askServer(userText, messages);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I couldn't process that right now. Please check your internet and API keys, then try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      if (!firstSent) setFirstSent(true);
    }
  }, [input, canUse, askServer]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      // Shift+Enter will create a newline naturally
    },
    [handleSend]
  );

  return (
    <div className="rounded-xl shadow p-4 max-w-3xl mx-auto w-full border bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Welth Finance Chatbot</div>
        {!canUse && (
          <div className="text-xs text-red-500">
            Sign in to use the chatbot
          </div>
        )}
      </div>

      <div className="space-y-3 relative h-[60vh] overflow-y-scroll pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl px-3 py-2 max-w-[85%]"
                  : "bg-muted text-foreground rounded-2xl px-3 py-2 max-w-[85%]"
              }
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Persistent loading row to avoid first-load blinking */}
        <div className="pt-1 min-h-5">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground transition-opacity ${loading ? "opacity-100" : "opacity-0"}`} aria-hidden={!loading}>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating answer...
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!canUse || loading}
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button onClick={handleSend} disabled={!canUse || loading}>
          Send
        </Button>
      </div>

      <div className="mt-2 text-[10px] text-muted-foreground">
        Tips: Try &quot;How much did I spend this month?&quot;, &quot;Top expense category?&quot;, &quot;Income vs expense summary&quot;, &quot;Investment ideas for beginners&quot;, or &quot;Financial insights based on my spending&quot;.
      </div>
    </div>
  );
}


