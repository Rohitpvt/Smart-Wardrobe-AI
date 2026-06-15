import { useEffect, useRef } from "react";
import { ChatMessage as IChatMessage } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Bot, Sparkles } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface StylistChatPanelProps {
  messages: IChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export function StylistChatPanel({ messages, onSendMessage, isLoading }: StylistChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-bg-dark to-bg-darker rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
            <Bot className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              AI Stylist
              <Sparkles className="w-4 h-4 text-brand-teal" />
            </h2>
            <p className="text-xs text-white/50">Always learning, always ready.</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-brand-purple" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Welcome to your Personal Stylist Workspace</h3>
            <p className="text-white/60 max-w-sm mb-8">
              Ask me for outfit recommendations, advice on your rotation, or what you should buy next.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {[
                "What should I wear tomorrow?",
                "Show me outfits using underworn items.",
                "How has my style changed recently?",
                "What color should I buy next?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-brand-purple/20 hover:border-brand-purple/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-4xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 py-4 text-white/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                    <Bot className="w-4 h-4 text-brand-purple animate-pulse" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
