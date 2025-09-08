import express from 'express';
import cors from 'cors';
import fs from 'fs';
const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));
const version = packageJson.version;
import { router as identityRouter } from './routes/identity.js';

const app = express();
const PORT = 3000 || process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/static', express.static('dist'));

// Rotas
app.use('/identity', identityRouter);

// Endpoint de status
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        version: version
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/status`);
    console.log(`🔒 Endpoint SDK: http://localhost:${PORT}/identity/verify`);
});

