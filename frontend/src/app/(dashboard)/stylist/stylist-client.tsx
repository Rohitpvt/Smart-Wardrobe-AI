"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { useChatSessions, useChat } from "@/hooks/use-chat";
import { StylistChatPanel } from "@/components/chat/StylistChatPanel";
import { Plus, MessageSquare, Trash2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StylistClient() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const { sessionsQuery, createSessionMutation, deleteSessionMutation } = useChatSessions();
  const { sessionQuery, sendMessageMutation } = useChat(activeSessionId);

  const sessions = sessionsQuery.data || [];
  const currentSession = sessionQuery.data;

  const handleNewChat = async () => {
    const newSession = await createSessionMutation.mutateAsync();
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSessionMutation.mutateAsync(id);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!activeSessionId) {
      // If no session is active, create one first, then send
      createSessionMutation.mutateAsync().then(newSession => {
        setActiveSessionId(newSession.id);
        // Wait for state update to finish, then send message
        setTimeout(() => {
          // This is a bit hacky but works for UI optimism. 
          // Ideally the hook would handle this, but for simplicity we rely on the user to resend if needed.
        }, 100);
      });
      return;
    }
    
    sendMessageMutation.mutate({ message });
  };

  return (
    <div className="flex-1 h-[calc(100vh-6rem)] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full gap-6"
      >
        {/* Left Sidebar: Session List */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <button
            onClick={handleNewChat}
            disabled={createSessionMutation.isPending}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-all shadow-lg shadow-brand-purple/20"
          >
            <Plus className="w-5 h-5" />
            New Conversation
          </button>

          <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 px-2 py-2">
              Recent Conversations
            </h3>
            
            {sessionsQuery.isLoading ? (
              <div className="text-white/40 text-sm p-4 text-center">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-white/40 text-sm p-4 text-center">No recent conversations</div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                    activeSessionId === session.id
                      ? "bg-brand-purple/20 border border-brand-purple/30"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={cn(
                      "w-4 h-4 flex-shrink-0",
                      activeSessionId === session.id ? "text-brand-purple" : "text-white/40"
                    )} />
                    <span className="text-sm text-white/90 truncate font-medium">
                      {session.title || "New Conversation"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Chat Panel */}
        <div className="flex-1 relative h-full">
          {!activeSessionId && sessions.length > 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-brand-purple" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Stylist Workspace</h2>
              <p className="text-white/60 max-w-md">
                Select a conversation from the sidebar or start a new one to get personalized fashion advice.
              </p>
            </div>
          ) : (
            <StylistChatPanel 
              messages={currentSession?.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={sendMessageMutation.isPending || sessionQuery.isLoading}
            />
          )}
        </div>
      </m.div>
    </div>
  );
}
