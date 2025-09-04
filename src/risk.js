const weights = {
    canvas: 20,
    webgl: 15,
    audio: 5,
    mouseEvents: 25,
    keyboardEvents: 20,
    timezoneUTC: 10,
    highValuePurchase: 30
};

export function evaluateRisk(data) {
    let score = 0;
    score += !data.fingerprints?.canvas ? weights.canvas : 0;
    score += !data.fingerprints?.webgl ? weights.webgl : 0;
    score += !data.fingerprints?.audio ? weights.audio : 0;
    score += (data.behavior?.mouseEvents?.length < 5) ? weights.mouseEvents : 0;
    score += (data.behavior?.keyboardEvents?.length < 3) ? weights.keyboardEvents : 0;
    score += (data.timezone?.timezone === 'UTC') ? weights.timezoneUTC : 0;
    score += (data.action?.action === 'purchase' && data.action?.amount > 1000) ? weights.highValuePurchase : 0;
    return Math.min(100, score);
}

export function riskDecision(score, data, threshold = 45) {
    let decision = 'allow';
    if (score >= threshold) decision = 'deny';
    else if (score >= threshold * 0.7) decision = 'review';
    else decision = 'allow';

    const reasons = [];
    if (score >= threshold) reasons.push('Comportamento suspeito detectado');
    if (!data.fingerprints?.canvas) reasons.push('Fingerprint de canvas ausente');
    if (!data.behavior?.mouseEvents?.length < 5) reasons.push('Movimentação do mouse suspeita ou insuficiente');
    if (data.action?.amount > 1000) reasons.push('Valor de transação alto');
    return { decision, reasons };
}