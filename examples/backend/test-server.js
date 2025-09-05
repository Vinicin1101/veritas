// Servidor de teste simples para simular backend
import express from 'express';
import cors from 'cors';
import { evaluateRisk, riskDecision } from './risk.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Permitir configuração via env ou parâmetro
const DEFAULT_RISK_THRESHOLD = process.env.RISK_THRESHOLD
    ? parseInt(process.env.RISK_THRESHOLD, 10)
    : 40;

// Middleware antifraude configurável
function antifraudMiddleware(req, res, next) {
    const data = req.body;
    const score = evaluateRisk(data);
    
    // Decisão baseada em threshold padrão ou customizado
    const { decision, reasons } = riskDecision(score, data, DEFAULT_RISK_THRESHOLD);

    req.risk = { score, decision, reasons, threshold: DEFAULT_RISK_THRESHOLD };
    next();
}

// Endpoint principal do SDK
app.post('/identity/verify', antifraudMiddleware, (req, res) => {
    const { score, decision, reasons } = req.risk;
    const response = {
        decision,
        score,
        sessionId: req.body.sessionId || req.body.sdkSessionId,
        timestamp: Date.now(),
        reasons
    };
    res.json(response);
});

// Endpoint de status
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        version: '1.0.0'
    });
});

// Servir arquivos estáticos para teste
app.use('/static', express.static('dist'));

app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/status`);
    console.log(`🔒 Endpoint SDK: http://localhost:${PORT}/identity/verify`);
});

