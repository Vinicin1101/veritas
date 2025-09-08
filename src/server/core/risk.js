import { DECISIONS, THRESHOLDS } from '../../../types/risk.d.ts';

export class RiskEvaluationEngine {
  constructor(rules = []) {
    this.rules = rules;
    this.thresholds = { ...THRESHOLDS };
  }

  /**
   * Avalia o risco baseado em dados coletados.
   * @param {Object} data - Saída do collectData ou similar
   */
  async evaluate(data, ruleResults = []) {
    const behavioralMetrics = this._extractBehaviorMetrics(data.behavior || {});
    const fingerprintData = this._extractFingerprintData(data);

    const scores = {
      ruleScore: this._calculateRuleScore(ruleResults),
      behavioralScore: this._calculateBehavioralScore(behavioralMetrics),
      fingerprintScore: this._calculateFingerprintScore(fingerprintData),
      facialScore: this._calculateFacialScore(data.facial),
      dataQualityScore: this._calculateDataQualityScore(data, behavioralMetrics, fingerprintData)
    };

    const finalScore = this._combineScores(scores);

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      breakdown: scores,
      decision: this.getDecision(finalScore),
      reasons: this._generateReasons({ ...scores, finalScore })
    };
  }

  // ==================== Extratores ====================

  _extractBehaviorMetrics(behavior) {
    const now = Date.now();
    const totalEvents =
      (behavior.mouseEvents?.length || 0) +
      (behavior.keyboardEvents?.length || 0) +
      (behavior.focusEvents?.length || 0) +
      (behavior.scrollEvents?.length || 0) +
      (behavior.clickEvents?.length || 0);

    const duration = now - (behavior.startTime || now);

    const clickFreq = behavior.clickFrequency || 0;
    const scrollFreq = (behavior.scrollEvents?.length || 0) / (duration / 1000);
    const keystrokeFreq = (behavior.keyboardEvents?.length || 0) / (duration / 1000);
    const mouseDistance = this._calculateMouseDistance(behavior.mouseEvents || []);

    return {
      duration,
      totalEvents,
      metrics: { clickFrequency: clickFreq, scrollFrequency: scrollFreq, keystrokeFrequency: keystrokeFreq, mouseMovementDistance: mouseDistance },
      startTime: behavior.startTime || Date.now()
    };
  }

  _extractFingerprintData(data) {
    return {
      userAgent: data.browser?.userAgent || '',
      language: data.browser?.language || '',
      platform: navigator.platform || '',
      screenResolution: `${data.behavior?.screen?.width || 0}x${data.behavior?.screen?.height || 0}`,
      timezone: data.timezone?.timezone || '',
      canvasFingerprint: data.fingerprint?.canvasFingerprint || null,
      webglFingerprint: data.fingerprint?.webglFingerprint || null,
      audioFingerprint: data.fingerprint?.audioFingerprint || null,
      fonts: data.fingerprint?.fonts || []
    };
  }

  _calculateMouseDistance(events) {
    if (events.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < events.length; i++) {
      const dx = events[i].x - events[i - 1].x;
      const dy = events[i].y - events[i - 1].y;
      dist += Math.sqrt(dx * dx + dy * dy);
    }
    return dist;
  }

  // ==================== Regras ====================

  _evaluateRules(context) {
    if (!this.rules.length) return [];
    return this.rules.map(rule => {
      try {
        const score = eval(rule.expression) ? rule.weight : 0;
        return { id: rule.id, name: rule.name, weight: rule.weight, score };
      } catch {
        return { id: rule.id, name: rule.name, weight: rule.weight, score: 0, error: true };
      }
    });
  }

  _calculateRuleScore(ruleResults) {
    if (!ruleResults || ruleResults.length === 0) return 50;
    let totalScore = 0, totalWeight = 0;
    for (const r of ruleResults) {
      if (r.error) continue;
      totalScore += r.score;
      totalWeight += Math.abs(r.weight);
    }
    if (totalWeight === 0) return 50;
    return ((totalScore / totalWeight) + 1) * 50;
  }

  // ==================== Scores individuais ====================

  _calculateBehavioralScore(behavioral) {
    if (!behavioral) return 30;
    let score = 50;
    const { duration, totalEvents, metrics } = behavioral;

    if (duration > 60000) score += 10;
    else if (duration < 10000) score -= 20;

    if (totalEvents > 20) score += 10;
    else if (totalEvents < 5) score -= 15;

    const { clickFrequency, scrollFrequency, keystrokeFrequency, mouseMovementDistance } = metrics;

    if (clickFrequency > 0.1 && clickFrequency < 2.0) score += 5;
    else if (clickFrequency > 5.0) score -= 10;

    if (scrollFrequency > 0.05 && scrollFrequency < 1.0) score += 5;
    else if (scrollFrequency > 3.0) score -= 10;

    if (keystrokeFrequency > 0.1 && keystrokeFrequency < 3.0) score += 5;
    else if (keystrokeFrequency > 10.0) score -= 15;

    if (mouseMovementDistance > 100) score += 5;
    else if (mouseMovementDistance < 10) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  _calculateFingerprintScore(fingerprint) {
    if (!fingerprint) return 0;
    let score = 50;
    const requiredFields = ['userAgent','language','platform','screenResolution','timezone','canvasFingerprint','webglFingerprint','audioFingerprint'];
    let completeness = 0;
    for (const f of requiredFields) if (fingerprint[f] && fingerprint[f] !== 'unknown') completeness++;
    score += (completeness / requiredFields.length) * 30;
    if (fingerprint.canvasFingerprint?.length > 100) score += 5;
    if (fingerprint.webglFingerprint && fingerprint.webglFingerprint !== 'webgl_not_supported') score += 5;
    if (fingerprint.audioFingerprint && fingerprint.audioFingerprint !== 'audio_error') score += 5;
    if (fingerprint.fonts?.length > 5) score += 5;

    const suspiciousPatterns = ['bot','crawler','spider','scraper'];
    for (const pattern of suspiciousPatterns) {
      if (fingerprint.userAgent.toLowerCase().includes(pattern)) { score -= 30; break; }
    }

    return Math.max(0, Math.min(100, score));
  }

  _calculateFacialScore(facial) {
    if (!facial) return 50;
    if (facial.error) return 40;
    if (facial.imageData) return 80;
    return 50;
  }

  _calculateDataQualityScore(data, behavioral, fingerprint) {
    let score = 50;
    const now = Date.now();
    const dataAge = now - data.timestamp;
    if (dataAge < 60000) score += 10;
    else if (dataAge > 300000) score -= 20;

    if (fingerprint) score += 10;
    if (behavioral) score += 10;
    if (data.facial && !data.facial.error) score += 10;

    if (fingerprint && behavioral && fingerprint.timestamp && behavioral.startTime) {
      const diff = Math.abs(fingerprint.timestamp - behavioral.startTime);
      if (diff < 300000) score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  _combineScores(scores) {
    const weights = { rule: 0.4, behavioral: 0.25, fingerprint: 0.2, facial: 0.1, dataQuality: 0.05 };
    let weighted = 0, total = 0;
    for (const [type, score] of Object.entries(scores)) {
      if (score != null) { weighted += score * weights[type]; total += weights[type]; }
    }
    return total > 0 ? weighted / total : 50;
  }

  _generateReasons(scores) {
    const reasons = [];
    const { finalScore, ruleScore, behavioralScore, fingerprintScore, facialScore, dataQualityScore } = scores;
    if (finalScore >= 80) reasons.push('Alta confiança baseada em análise abrangente dos dados');
    else if (finalScore >= 60) reasons.push('Confiança moderada com alguns fatores de risco');
    else if (finalScore >= 40) reasons.push('Baixa confiança com múltiplos fatores de risco');
    else reasons.push('Confiança muito baixa com fatores de risco significativos');

    if (ruleScore < 40) reasons.push('Falha em múltiplas regras de segurança');
    if (behavioralScore < 40) reasons.push('Dados comportamentais insuficientes ou suspeitos');
    if (fingerprintScore < 40) reasons.push('Fingerprint do dispositivo incompleto ou suspeito');
    if (facialScore >= 80) reasons.push('Verificação facial bem-sucedida');
    if (dataQualityScore < 40) reasons.push('Qualidade dos dados ruim ou informações desatualizadas');
    return reasons;
  }

  getDecision(score) {
    if (score >= this.thresholds.allow) return DECISIONS.allow;
    else if (score >= this.thresholds.review) return DECISIONS.review;
    else return DECISIONS.deny;
  }

  updateThresholds(newThresholds) { this.thresholds = { ...this.thresholds, ...newThresholds }; }
  getThresholds() { return { ...this.thresholds }; }
}
