import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 max-w-4xl mx-auto"
      >
        <div className="relative flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-purple/50 focus-within:bg-white/10 transition-all overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your personal stylist..."
            className="w-full max-h-[120px] bg-transparent border-none text-white placeholder:text-white/40 px-4 py-3 resize-none focus:ring-0 outline-none min-h-[48px]"
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-all",
            value.trim() && !isLoading
              ? "bg-brand-purple text-white hover:bg-brand-purple/80 hover:shadow-lg shadow-brand-purple/20"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-1" />
          )}
        </button>
      </form>
    </div>
  );
}
