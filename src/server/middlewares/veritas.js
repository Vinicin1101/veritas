// src/server/middlewares/veritas.js
import { RiskEvaluationEngine } from '../core/risk.js';
import { RuleManager } from '../core/rule.js';

// Inicializa o gerenciador de regras e o motor de avaliação de risco
const ruleManager = new RuleManager("./rules.json");
const riskEvaluation = new RiskEvaluationEngine(ruleManager.getConfig().rules);


// Middleware antifraude configurável
async function antifraudMiddleware(req, res, next) {
    const data = req.body;
    console.log(data);
    
    // Executa as regras e avalia o risco
    const ruleResults = await ruleManager.runRules(data);
    console.log(ruleResults);
    

    riskEvaluation.evaluate(data, ruleResults).then(result => {
        const decision = riskEvaluation.getDecision(result.score);
        req.risk = {
            score: result.score,
            decision,
            reasons: result.reasons,
            breakdown: result.breakdown,
            thresholds: riskEvaluation.getThresholds()
        };
        next();
    }).catch(err => {
        req.risk = {
            score: 0,
            decision: 'deny',
            reasons: ['Erro na avaliação de risco'],
            error: err.message
        };
        next();
    });
}

export { antifraudMiddleware };