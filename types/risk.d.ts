export type DecisionType = 'allow' | 'review' | 'deny';

export interface RiskThresholds {
  allow: number;
  review: number;
  deny: number;
}

export const DECISIONS: Record<DecisionType, DecisionType> = {
  allow: 'allow',
  review: 'review',
  deny: 'deny'
};

export const THRESHOLDS: RiskThresholds = {
  allow: 70,
  review: 40,
  deny: 0
};

export interface RuleResult {
  score: number;
  weight: number;
  error?: boolean;
}

export interface RiskBreakdown {
  rule?: number;
  behavioral?: number;
  fingerprint?: number;
  facial?: number;
  dataQuality?: number;
}

export interface RiskScoreResult {
  score: number;
  reasons: string[];
  breakdown: RiskBreakdown;
}