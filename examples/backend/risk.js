const weights = {
    plugins: 10,
    cookies: 20,
    mouseEvents: 25,
    keyboardEvents: 20,
    timezoneUTC: 10,
    highValuePurchase: 30
};

export function evaluateRisk(data) {
    console.log(data);
    let score = 0;
    score += (data.plugins?.length <= 2 || data.plugins === undefined) ? weights.plugins : 0;
    score += (data.storage?.cookies === false || data.storage?.cookies === undefined) ? weights.cookies : 0;
    score += (data.behavior?.keyboardEvents?.length <= 5 || data.keyboardEvents?.length === undefined) ? weights.keyboardEvents : 0;
    score += (data.behavior?.mouseEvents?.length <= 40 || data.behavior?.mouseEvents === undefined) ? weights.mouseEvents : 0;
    score += (data.timezone?.timezone === 'UTC' || data.timezone?.timezone === undefined) ? weights.timezoneUTC : 0;
    score += (data.action?.action === 'purchase' && data.action?.amount > 1000) ? weights.highValuePurchase : 0;
    return Math.min(10000, score);
}

export function riskDecision(score, data, threshold = 45) {
    let decision = 'allow';
    if (score >= threshold) decision = 'deny';
    else if (score >= threshold * 0.7) decision = 'review';
    else decision = 'allow';

    const reasons = [];
    if (score >= threshold) reasons.push('Comportamento suspeito detectado');
    if (data.behavior?.mouseEvents?.length <= 40) reasons.push('Movimentação do mouse suspeita ou insuficiente');
    if (data.action?.amount > 1000) reasons.push('Valor de transação alto');
    return { decision, reasons };
}