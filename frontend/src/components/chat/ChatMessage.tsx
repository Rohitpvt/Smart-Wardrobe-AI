import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { ChatMessage as IChatMessage } from "@/types/chat";
import { ActionCard } from "./ActionCard";
import { Bot, User as UserIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: IChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  // Format content by splitting newlines into paragraphs
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <m.div
      variants={fadeUp}
      className={cn(
        "flex w-full gap-4 py-4",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {/* Avatar (Assistant) */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
          <Bot className="w-4 h-4 text-brand-purple" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] flex flex-col gap-2",
          !isAssistant && "items-end"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isAssistant
              ? "bg-white/5 border border-white/10 rounded-tl-sm text-white/90"
              : "bg-brand-purple/80 border border-brand-purple text-white rounded-tr-sm"
          )}
        >
          {message.content && (
            <div className="text-[15px]">{renderContent(message.content)}</div>
          )}

          {/* Reasoning UI (Explainability layer) */}
          {message.reasoning && message.reasoning.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                <span className="text-xs font-medium uppercase tracking-wider text-brand-teal">
                  Stylist Reasoning
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {message.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="text-white/30 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Cards */}
        {message.tool_invocations && message.tool_invocations.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.tool_invocations.map((action, idx) => (
              <ActionCard key={idx} action={action} />
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <span className="text-[10px] text-white/40 mt-1 px-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Avatar (User) */}
      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <UserIcon className="w-4 h-4 text-white/80" />
        </div>
      )}
    </m.div>
  );
}
