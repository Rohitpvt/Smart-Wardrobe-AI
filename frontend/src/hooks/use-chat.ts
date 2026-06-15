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
    onError: (err, newMsg, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(["chat-session", sessionId], context.previousSession);
      }
      toast.error("Failed to send message. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-session", sessionId] });
      // Invalidate list to get updated titles/timestamps
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });

  return {
    sessionQuery,
    sendMessageMutation,
  };
}
