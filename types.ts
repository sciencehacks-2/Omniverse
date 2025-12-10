export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databasePath: string; // e.g., "/devices/esp32/command"
}

export interface GitLabConfig {
  personalAccessToken: string;
  projectId: string;
  filePath: string;
  branch: string;
}

export interface GitLabFileResponse {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  content_sha256?: string;
  ref?: string;
  blob_id?: string;
  commit_id?: string;
  last_commit_id?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export enum Tab {
  CONTROL = 'CONTROL',
  CONFIG = 'CONFIG',
  LOGS = 'LOGS'
}