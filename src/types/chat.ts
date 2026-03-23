export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderTeamId: string | null;
  text: string;
  type: 'message' | 'system';
  timestamp: number;
}

export interface ActivityEvent {
  id: string;
  type: 'bid' | 'sold' | 'unsold' | 'join' | 'leave' | 'start' | 'pause' | 'end';
  data: Record<string, unknown>;
  timestamp: number;
}
