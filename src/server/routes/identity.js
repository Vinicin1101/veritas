// Rota para verificação de identidade
import { Router } from 'express';
import { antifraudMiddleware } from '../middlewares/veritas.js';

export const router = Router();

router.post('/verify', await antifraudMiddleware, (req, res) => {
    const { score, decision, reasons, breakdown, thresholds } = req.risk;
    res.json({
        decision,
        score,
        reasons,
        breakdown,
        thresholds,
        sessionId: req.body.sessionId || req.body.sdkSessionId,
        timestamp: Date.now()
    });
});

export default router;