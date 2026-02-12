export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  SVG = 'svg',
  CODE = 'code',
  TABLE = 'table',
  SEARCH_RESULT = 'search_result',
  DOCUMENT = 'document',
  APP_BUILD = 'app_build'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface MachineTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  type: string;
  timestamp: number;
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export interface MachineMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: ContentType;
  metadata?: any; 
  attachments?: Attachment[];
  timestamp: number;
  isThinking?: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  title?: string;
}

export interface AppBuildStatus {
  step: string;
  progress: number;
  logs: string[];
  status: 'building' | 'complete' | 'failed';
}

export interface IntegrationService {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  color: string;
}

export type AgentPersonaType = 'general' | 'frontend' | 'backend' | 'mobile' | 'data_analyst';