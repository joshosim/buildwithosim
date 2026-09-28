"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey 👋 I’m Osim’s assistant. What are you looking to build?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "The assistant is unavailable right now.");
      }

      const assistantMessage: Message = data.message ?? data.choices[0].message;

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <section className="w-full max-w-2xl">
      {/* Chat Container */}
      <div className="border border-line overflow-hidden">
        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted space-y-3">
              <Bot size={48} className="opacity-20" />
              <p className="text-sm font-light">Start a conversation...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === "user" ? "flex-row-reverse" : ""
                }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border border-line ${m.role === "user"
                  ? "bg-fg text-bg"
                  : "bg-surface text-muted"
                  }`}
              >
                {m.role === "user" ? (
                  <User size={14} />
                ) : (
                  <Bot size={14} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${m.role === "user"
                  ? "bg-fg text-bg"
                  : "bg-surface text-fg border border-line"
                  }`}
              >
                {m.role === "assistant" ? (
                  <div className="chat-markdown">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-surface border border-line flex items-center justify-center text-muted">
                <Bot size={14} />
              </div>
              <div className="bg-surface border border-line px-4 py-3">
                <Loader2 size={16} className="animate-spin text-accent" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-line p-4 bg-surface">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-surface border border-line text-fg placeholder:text-muted px-4 py-3 text-sm resize-none focus:outline-none focus:border-line-strong transition-all min-h-[44px] max-h-[120px]"
              style={{ height: "auto" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-fg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-bg p-3 transition-colors duration-200"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-muted mt-2 text-center uppercase tracking-widest">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </section>
  );
}
