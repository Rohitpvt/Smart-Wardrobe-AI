export type FeedbackType = 'like' | 'love' | 'dislike' | 'save_for_later' | 'wore_it' | 'skip';

export interface StyleMemoryProfile {
  favorite_colors: string[];
  disliked_colors: string[];
  favorite_categories: string[];
  preferred_style: string;
  confidence_score: number;
  learning_tier: string;
  interaction_count: number;
  recently_learned_insights: string[];
  weights_dump?: Record<string, any>;
}

export interface StyleMemoryResponse {
  success: boolean;
  data: StyleMemoryProfile;
}

export interface FeedbackRequest {
  outfit_id: string;
  feedback_type: FeedbackType;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}
