// Shared enums
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export enum UserAvailability {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE',
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum ChannelType {
  WHATSAPP = 'WHATSAPP',
}

export enum AssignmentStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  MANUAL = 'MANUAL',
}

// Shared types
export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  role: UserRole;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// WebSocket event types
export const WS_EVENTS = {
  MESSAGE_NEW: 'message:new',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_ASSIGNED: 'conversation:assigned',
  USER_AVAILABILITY: 'user:availability',
} as const;
