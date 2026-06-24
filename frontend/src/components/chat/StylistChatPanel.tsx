import { useEffect, useRef } from "react";
import { ChatMessage as IChatMessage } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Bot, Sparkles, AlertTriangle } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThinkingBubbleSkeleton } from "@/components/ui/skeleton-loaders";

interface StylistChatPanelProps {
  messages: IChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  error?: any;
}

export function StylistChatPanel({ messages, onSendMessage, isLoading, error }: StylistChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, error]);

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
            <h3 className="text-xl font-medium text-white mb-2">Welcome to Smart Wardrobe AI.</h3>
            <p className="text-white/60 max-w-sm mb-8">
              I'm your personal AI stylist, wardrobe analyst, and outfit strategist.
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
                  className="py-4"
                >
                  <ThinkingBubbleSkeleton />
                </m.div>
              )}
            </AnimatePresence>

            {error && error.response?.data?.detail && error.response.data.detail.status && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 max-w-md mt-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-medium">
                    {error.response.data.detail.status === "user_ai_quota_exceeded" && "Gemini quota reached"}
                    {error.response.data.detail.status === "user_ai_key_invalid" && "Gemini key needs attention"}
                    {error.response.data.detail.status === "gemini_temporarily_unavailable" && "Gemini is busy"}
                    {![ "user_ai_quota_exceeded", "user_ai_key_invalid", "gemini_temporarily_unavailable" ].includes(error.response.data.detail.status) && "Failed to send message"}
                  </h3>
                </div>
                <p className="text-sm text-red-200/80 leading-relaxed">
                  {error.response.data.detail.status === "user_ai_quota_exceeded" && "Your Gemini API key has reached its quota or rate limit. Please wait, check your Google AI Studio quota, or add another Gemini API key."}
                  {error.response.data.detail.status === "user_ai_key_invalid" && "Your Gemini API key is invalid or no longer has permission. Please replace it to continue using AI features."}
                  {error.response.data.detail.status === "gemini_temporarily_unavailable" && "Gemini is temporarily unavailable or experiencing high demand. Please try again shortly."}
                  {![ "user_ai_quota_exceeded", "user_ai_key_invalid", "gemini_temporarily_unavailable" ].includes(error.response.data.detail.status) && (error.response.data.detail.message || "An unexpected error occurred.")}
                </p>
                <div className="flex justify-end mt-2">
                  {error.response.data.detail.status === "gemini_temporarily_unavailable" || ![ "user_ai_quota_exceeded", "user_ai_key_invalid", "gemini_temporarily_unavailable" ].includes(error.response.data.detail.status) ? (
                    <button 
                      onClick={() => {
                        const lastMsg = [...messages].reverse().find(m => m.role === 'user');
                        if (lastMsg) onSendMessage(lastMsg.content);
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Retry
                    </button>
                  ) : (
                    <Link 
                      href="/settings/ai-access"
                      className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {error.response.data.detail.status === "user_ai_quota_exceeded" ? "Manage Gemini Key" : "Replace Gemini Key"}
                    </Link>
                  )}
                </div>
              </m.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
