"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

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

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      let assistantMessage: Message;

      if (data.message) {
        //custom response message from tool
        assistantMessage = data.message;
      } else {
        // ✅ normal AI response
        assistantMessage = data.choices[0].message;
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
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
    <section className="w-full max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chat with BuildWithOsim AI</h2>
        <p className="text-gray-400">Ask me anything about my work and experience</p>
      </div>

      {/* Chat Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
              <Bot size={48} className="opacity-50" />
              <p className="text-sm">Start a conversation...</p>
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
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === "user"
                  ? "bg-indigo-500"
                  : "bg-gray-700"
                  }`}
              >
                {m.role === "user" ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-md"
                  : "bg-gray-800 text-gray-100 rounded-bl-md"
                  }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-900/50">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[44px] max-h-[120px]"
              style={{ height: "auto" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </section>
  );
}