export enum BugType {
  LINTING = 'LINTING',
  SYNTAX = 'SYNTAX',
  LOGIC = 'LOGIC',
  TYPE_ERROR = 'TYPE_ERROR',
  IMPORT = 'IMPORT',
  INDENTATION = 'INDENTATION',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  DEPRECATION = 'DEPRECATION'
}

export enum FixStatus {
  FIXED = 'FIXED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFYING = 'VERIFYING'
}

export interface FixRecord {
  id: string;
  file: string;
  line: number;
  bugType: BugType;
  description: string;
  commitMessage: string;
  status: FixStatus;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'command';
}

export interface CICDRun {
  id: number;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING';
  timestamp: string;
  duration: string;
}

export enum AgentStage {
  IDLE = 'IDLE',
  CLONING = 'CLONING',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  FIXING = 'FIXING',
  TESTING = 'TESTING',
  PUSHING = 'PUSHING',
  DEPLOYING = 'DEPLOYING'
}

export interface AgentStats {
  totalBugs: number;
  fixedBugs: number;
  failedFixes: number;
  activeRepo: string | null;
  uptime: number; // in seconds
}