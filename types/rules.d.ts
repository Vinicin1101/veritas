/**
 * Tipos e interfaces para o RuleManager
 */

export type RuleAction = "allow" | "review" | "deny";

export interface Thresholds {
  allow: number;
  review: number;
  deny: number;
}

export interface RuleDefinition {
  id: string;
  name: string;
  condition: string;
  weight: number;
  action: RuleAction;
  enabled?: boolean;
  expression?: string;
  description?: string;
}

export interface RuleExecutionResult {
  id: string;
  name: string;
  passed: boolean;
  weight: number;
  score: number;
  action?: RuleAction;
  expression?: string;
  description?: string;
  error?: string;
}

export interface InputContext {
  fingerprint?: Record<string, any>;
  behavior?: Record<string, any>;
  sessionId?: string;
  timestamp?: string | number | Date;
}

export interface RunOptions {
  ruleId?: string;
}

export interface RuleConfig {
  rules: RuleDefinition[];
  thresholds: Thresholds;
  rulesFile: string;
}

export interface RuleStats {
  total: number;
  enabled: number;
  byAction: {
    allow: number;
    review: number;
    deny: number;
  };
  byWeight: {
    positive: number;
    negative: number;
    neutral: number;
  };
  lastUpdate?: string;
}

/**
 * Definição da classe RuleManager
 */
export declare class RuleManager {
  rulesFile: string;
  ruleSet: RuleDefinition[];
  thresholds: Thresholds;
  lastUpdate?: string;

  constructor(rulesFile: string);

  loadConfig(): Promise<void>;
  runRules(inputData: InputContext, options?: RunOptions): Promise<RuleExecutionResult[]>;
  getConfig(): RuleConfig;
  reload(): Promise<void>;
  getStats(): RuleStats;
}
