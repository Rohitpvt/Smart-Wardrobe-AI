import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  ChatSession, 
  ChatSessionDetail, 
  SessionListResponse, 
  ChatResponse 
} from "@/types/chat";
import { toast } from "sonner";

export function useChatSessions() {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async (): Promise<ChatSession[]> => {
      const response = await api.get<SessionListResponse>("/chat/sessions");
      return response.data.data;
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (): Promise<ChatSession> => {
      const response = await api.post<ChatSession>("/chat/sessions");
      return response.data;
    },
    onSuccess: (newSession) => {
      queryClient.setQueryData(["chat-sessions"], (old: ChatSession[] | undefined) => {
        if (!old) return [newSession];
        return [newSession, ...old];
      });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/chat/sessions/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["chat-sessions"], (old: ChatSession[] | undefined) => {
        if (!old) return [];
        return old.filter(s => s.id !== deletedId);
      });
    },
  });

  return {
    sessionsQuery,
    createSessionMutation,
    deleteSessionMutation,
  };
}

export function useChat(sessionId: string | null) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["chat-session", sessionId],
    queryFn: async (): Promise<ChatSessionDetail> => {
      const response = await api.get<ChatSessionDetail>(`/chat/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }): Promise<ChatResponse> => {
      const response = await api.post<ChatResponse>(`/chat/sessions/${sessionId}/messages`, { message });
      return response.data;
    },
    onMutate: async ({ message }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["chat-session", sessionId] });
      const previousSession = queryClient.getQueryData<ChatSessionDetail>(["chat-session", sessionId]);

      if (previousSession) {
        queryClient.setQueryData<ChatSessionDetail>(["chat-session", sessionId], {
          ...previousSession,
          messages: [
            ...previousSession.messages,
            {
              id: `temp-${Date.now()}`,
              session_id: sessionId!,
              role: "user",
              content: message,
              created_at: new Date().toISOString(),
            }
          ]
        });
      }
      return { previousSession };
    },
    onError: (err: any, newMsg, context) => {
      // Keep optimistic message in UI so the user sees their message.
      const detail = err?.response?.data?.detail;
      if (detail?.status === "user_ai_quota_exceeded") {
        toast.error("Gemini quota reached. Please wait or check Google AI Studio.");
      } else if (detail?.status === "user_ai_key_invalid") {
        toast.error("Your Gemini key is invalid. Please replace it in AI Access settings.");
      } else if (detail?.status === "gemini_temporarily_unavailable") {
        toast.error("Gemini is temporarily busy. Please try again shortly.");
      } else if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
        toast.error("Request timed out. Gemini may be slow — please try again.");
      } else {
        toast.error(detail?.message || "Failed to send message. Please try again.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });

  return {
    sessionQuery,
    sendMessageMutation,
    error: sendMessageMutation.error,
  };
}
