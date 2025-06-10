// Servidor de teste simples para simular backend
import express from 'express';
import cors from 'cors';
import { createHmac } from 'crypto';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Função para verificar HMAC
function verifyHmac(message, signature, secret) {
    try {
        const expectedSignature = createHmac('sha256', secret)
            .update(message)
            .digest('base64');
        return expectedSignature === signature;
    } catch (error) {
        return false;
    }
}

// Função simples de avaliação de risco
function evaluateRisk(data) {
    let score = 0;
    
    // Verificar fingerprints
    if (!data.fingerprints?.canvas) score += 20;
    if (!data.fingerprints?.webgl) score += 15;
    if (!data.fingerprints?.audio) score += 10;
    
    // Verificar comportamento
    if (data.behavior?.mouseEvents?.length < 5) score += 25;
    if (data.behavior?.keyboardEvents?.length < 3) score += 20;
    
    // Verificar timezone suspeito
    if (data.timezone?.timezone === 'UTC') score += 15;
    
    // Ação específica
    if (data.action?.action === 'purchase' && data.action?.amount > 1000) {
        score += 30;
    }
    
    return Math.min(100, score);
}

// Endpoint principal do SDK
app.post('/identity/verify', (req, res) => {
    console.log('📨 Requisição recebida:', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        hasSignature: !!req.headers['x-sdk-signature']
    });
    
    const signature = req.headers['x-sdk-signature'];
    const secret = 'test-secret-key';
    
    // Verificar assinatura se presente
    if (signature) {
        const isValid = verifyHmac(
            JSON.stringify(req.body),
            signature,
            secret
        );
        
        if (!isValid) {
            console.log('❌ Assinatura HMAC inválida');
            return res.status(401).json({
                error: 'Assinatura inválida',
                decision: 'deny'
            });
        }
        console.log('✅ Assinatura HMAC válida');
    }
    
    // Avaliar risco
    const riskScore = evaluateRisk(req.body);
    let decision = 'allow';
    
    if (riskScore >= 80) {
        decision = 'deny';
    } else if (riskScore >= 50) {
        decision = 'review';
    }
    
    const response = {
        decision,
        score: riskScore,
        sessionId: req.body.sessionId || req.body.sdkSessionId,
        timestamp: Date.now(),
        reasons: []
    };
    
    // Adicionar razões baseadas no score
    if (riskScore >= 50) {
        response.reasons.push('Comportamento suspeito detectado');
    }
    if (!req.body.fingerprints?.canvas) {
        response.reasons.push('Fingerprint de canvas ausente');
    }
    if (req.body.action?.amount > 1000) {
        response.reasons.push('Valor de transação alto');
    }
    
    console.log('📊 Resposta:', response);
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

