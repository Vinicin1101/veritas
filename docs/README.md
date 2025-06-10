# Veritas

Veritas é uma SDK Antifraude para aplicações web desenvolvido pela FIAP x HAKAI. Integra frontend e backend de forma desacoplada e versionada, oferece coleta passiva de dados e avaliação de risco em tempo real.

## Características

- ✅ **Compatível com CDN**: Pode ser carregado diretamente via CDN
- ✅ **Suporte ES6 e CommonJS**: Funciona com `require()` e `import`
- ✅ **Múltiplos formatos**: UMD, ESM e CommonJS
- ✅ **TypeScript**: Definições de tipos incluídas
- ✅ **Fingerprinting avançado**: Canvas, WebGL, Audio
- ✅ **Coleta comportamental**: Mouse, teclado, foco, scroll
- ✅ **Assinatura HMAC**: Segurança na transmissão de dados
- ✅ **Coleta automática**: Configurável e não intrusiva

> (Nem tudo foi testado)

## Estrutura
```
Veritas
├── docs
│   └── README.md
├── examples          # Ambiente de teste e exemplificação
│   ├── backend
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── test-commonjs.js
│   │   ├── test-node.js
│   │   └── test-server.js
│   └── frontend
│       └── test-browser.html
├── src/
│   ├── collector.js  # módulo coletor
│   ├── crypt.js      # Hashing  
│   ├── index.js      # Core da SDK
│   ├── sender.js     # Conector de node
│   └── utils.js      # Utilitários
├── types
│   └── index.d.ts
├── package.json
├── package-lock.json
└── rollup.config.js  # configurações de compilação e minificação
```

## Instalação

### Via CDN

```html
<!-- Versão minificada para produção -->
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.min.js"></script>

<!-- Versão de desenvolvimento -->
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.js"></script>
```

### Via Package Manager

#### NPM

```bash
npm install @veritas/veritas-sdk
```

#### YARN
```bash
yarn add @veritas/veritas-sdk
```

## Uso

### Browser (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.min.js"></script>
<script>
  // Inicialização simples
  const sdk = Veritas.initSDK({
    endpoint: 'https://sua-api.com/identity/verify',
    secret: 'sua-chave-secreta',
    debug: true
  });

  // Verificar risco de uma ação
  sdk.checkRisk({ action: 'login', userId: '123' })
    .then(result => {
      console.log('Decisão:', result.decision); // 'allow', 'review', 'deny'
      console.log('Score:', result.score);
    })
    .catch(error => {
      console.error('Erro:', error);
    });
</script>
```

### Node.js (ESM)

```javascript
import { Veritas, initSDK } from '@veritas/veritas-sdk';

const sdk = new Veritas({
  endpoint: 'https://sua-api.com/identity/verify',
  secret: 'sua-chave-secreta',
  autoCollect: false // Desabilitar coleta automática no servidor
});

sdk.init();

// Coletar dados manualmente
const data = sdk.collect();
console.log('Dados coletados:', data);
```

### Node.js (CommonJS)

```javascript
const { AntifraudSDK } = require('@veritas/veritas-sdk');

const sdk = new AntifraudSDK({
  endpoint: 'https://sua-api.com/identity/verify',
  secret: 'sua-chave-secreta'
});

sdk.init();
```

## Configuração

### Opções disponíveis

```javascript
const options = {
  endpoint: 'https://sua-api.com/identity/verify', // URL do backend
  secret: 'sua-chave-secreta',                    // Chave para HMAC (opcional)
  autoCollect: true,                              // Coleta automática (padrão: true)
  collectInterval: 30000,                         // Intervalo de coleta em ms (padrão: 30s)
  timeout: 5000,                                  // Timeout das requisições (padrão: 5s)
  retries: 2,                                     // Tentativas de reenvio (padrão: 2)
  debug: false                                    // Logs de debug (padrão: false)
};
```

### Métodos principais

```javascript
// Inicializar SDK
const sdk = new AntifraudSDK(options);
sdk.init();

// Coletar dados
const data = sdk.collect();

// Enviar dados
const result = await sdk.send(data);

// Coletar e enviar (combinado)
const result = await sdk.collectAndSend();

// Verificar risco de ação específica
const result = await sdk.checkRisk({ action: 'purchase', amount: 100 });

// Controlar coleta automática
sdk.startAutoCollection();
sdk.stopAutoCollection();

// Reconfigurar
sdk.configure({ endpoint: 'nova-url' });

// Destruir SDK
sdk.destroy();
```

## Dados Coletados

O SDK coleta os seguintes tipos de dados de forma passiva:

### Informações do Browser
- User Agent, idioma, plataforma
- Plugins instalados
- Capacidades do navegador

### Informações da Tela
- Resolução, densidade de pixels
- Orientação da tela

### Fingerprinting
- **Canvas**: Hash único baseado em renderização
- **WebGL**: Informações da GPU
- **Audio**: Características do contexto de áudio

### Comportamento do Usuário
- Movimentos do mouse (coordenadas, não conteúdo)
- Eventos de teclado (teclas, não texto digitado)
- Eventos de foco e scroll
- Tempo de permanência

### Metadados
- Timezone e configurações regionais
- Capacidades de armazenamento
- Session ID único

## Segurança

- **Assinatura HMAC**: Todos os dados podem ser assinados com HMAC-SHA256
- **Coleta passiva**: Não captura conteúdo sensível (senhas, textos)
- **Configurável**: Todas as funcionalidades podem ser desabilitadas
- **Timeout**: Requisições têm timeout configurável
- **Retry**: Sistema de tentativas para maior confiabilidade

## Integração Backend

### Middleware Node.js/Express

```javascript
import { verifyHmac } from '@veritas/veritas-sdk/crypto';

app.post('/identity/verify', async (req, res) => {
  const signature = req.headers['x-sdk-signature'];
  const secret = 'sua-chave-secreta';
  
  // Verificar assinatura
  if (signature) {
    const isValid = await verifyHmac(
      JSON.stringify(req.body), 
      signature, 
      secret
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }
  }
  
  // Processar dados e avaliar risco
  const riskScore = evaluateRisk(req.body);
  
  res.json({
    decision: riskScore > 80 ? 'deny' : riskScore > 50 ? 'review' : 'allow',
    score: riskScore,
    sessionId: req.body.sessionId
  });
});
```

## Licença

MIT License - FIAP x HAKAI

## Suporte

Para dúvidas e suporte, consulte a documentação técnica completa ou entre em contato com a equipe de desenvolvimento.
