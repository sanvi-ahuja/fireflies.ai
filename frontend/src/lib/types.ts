export interface Participant {
  name: string;
  email?: string;
  avatar?: string;
}

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  start_time: number;
  end_time: number;
  speaker_name: string;
  speaker_avatar?: string;
  text: string;
}

export interface KeyTopic {
  timestamp: number;
  topic: string;
  description: string;
}

export interface Summary {
  id: string;
  meeting_id: string;
  overview: string;
  shorthand_bullet_points: string[];
  key_topics: KeyTopic[];
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  assignee_name?: string;
  assignee_email?: string;
  completed: boolean;
  due_date?: string;
  created_at: string;
}

export interface TranscriptHighlight {
  id: string;
  meeting_id: string;
  segment_id: string;
  user_name: string;
  text?: string;
  highlight_color: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration_seconds: number;
  audio_url?: string;
  video_url?: string;
  participants: Participant[];
  created_at: string;
  updated_at: string;
  segment_count?: number;
  action_item_count?: number;
}

export interface MeetingDetail extends Meeting {
  segments: TranscriptSegment[];
  summary?: Summary;
  action_items: ActionItem[];
  highlights: TranscriptHighlight[];
}

export interface AskAIResponse {
  answer: string;
  relevant_timestamps: number[];
}
