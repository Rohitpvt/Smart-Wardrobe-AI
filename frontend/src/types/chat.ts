export interface ToolInvocation {
  type: string;
  params: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  tool_invocations?: ToolInvocation[];
  reasoning?: string[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  reasons: string[];
  actions: ToolInvocation[];
}

export interface SessionListResponse {
  success: boolean;
  data: ChatSession[];
}
