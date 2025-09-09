# Veritas SDK: Solução Antifraude para Aplicações Web

Veritas é uma SDK (Software Development Kit) antifraude robusta e flexível, desenvolvida para proteger aplicações web contra atividades fraudulentas. Criada equipe Veritas para FIAP x HAKAI, esta SDK integra-se de forma desacoplada e versionada tanto no frontend quanto no backend, oferecendo coleta passiva de dados, avaliação de risco em tempo real e um sistema de regras configurável. Seu design modular e configurável permite uma adaptação fácil a diversas arquiteturas de sistema, garantindo segurança sem comprometer a experiência do usuário.

## Características Principais

A SDK Veritas foi projetada com um conjunto de características que a tornam uma solução antifraude completa e eficiente:

* **Compatibilidade com CDN**: Facilita a implantação e o carregamento rápido da SDK diretamente via Content Delivery Network (CDN), otimizando a performance em ambientes de produção.
* **Suporte a Múltiplos Módulos (ES6 e CommonJS)**: Garante flexibilidade para desenvolvedores, permitindo o uso tanto com `require()` (CommonJS) quanto com `import` (ES6), adaptando-se a diferentes ecossistemas JavaScript.
* **Formatos de Distribuição Versáteis**: Disponível em formatos UMD (Universal Module Definition), ESM (ECMAScript Modules) e CommonJS, assegurando ampla compatibilidade com diversas ferramentas e ambientes de desenvolvimento.
* **Tipagem Forte com TypeScript**: Inclui definições de tipos TypeScript (`.d.ts`) para a SDK principal, sistema de regras e avaliação de risco, melhorando a manutenibilidade do código, oferecendo autocompletar e detecção de erros em tempo de desenvolvimento.
* **Fingerprinting Avançado**: Utiliza técnicas sofisticadas de identificação de dispositivos, incluindo a coleta de hashes únicos baseados em renderização de Canvas, informações detalhadas de WebGL (GPU) e características do contexto de áudio, para criar uma impressão digital robusta do dispositivo.
* **Coleta Comportamental Detalhada**: Monitora e coleta dados sobre o comportamento do usuário através de um módulo especializado (`BehaviorCollector`), capturando movimentos do mouse, eventos de teclado, foco da janela e eventos de scroll. Esses dados são cruciais para identificar padrões de uso suspeitos e anômalos.
* **Sistema de Regras Configurável**: Inclui um motor de regras completo com regras padrão pré-configuradas (`default-rules.json`) e capacidade de gerenciamento programático de regras customizadas, permitindo avaliações de risco personalizadas.
* **Backend Integrado**: Oferece um servidor Express.js completo com middlewares, rotas de identidade e sistema de avaliação de risco, facilitando a implementação de uma solução antifraude end-to-end.
* **Assinatura HMAC para Segurança**: Garante a integridade e autenticidade dos dados transmitidos através da aplicação de assinaturas HMAC-SHA256, protegendo contra adulterações e acessos não autorizados.
* **Coleta de Dados Automática e Configurável**: Oferece um mecanismo de coleta de dados passiva que pode ser configurado para operar automaticamente, sem intrusão na experiência do usuário. A granularidade da coleta pode ser ajustada conforme a necessidade, permitindo desabilitar funcionalidades específicas.
* **Avaliação de Risco em Tempo Real**: Permite a verificação de risco para ações específicas através da análise dos dados coletados usando o motor de regras integrado, fornecendo decisões (`allow`, `review`, `deny`), scores de risco e informações sobre regras acionadas.

Essas características combinadas fazem da Veritas SDK uma ferramenta poderosa para mitigar fraudes, proporcionando uma camada de segurança proativa e adaptável para aplicações web modernas.

## Estrutura do Projeto

A estrutura do diretório da SDK Veritas foi reorganizada para separar claramente as funcionalidades de frontend e backend, facilitando o desenvolvimento, a manutenção e a compreensão do projeto. Abaixo, detalhamos os principais componentes:

```
Veritas/
├── dist/                          # Arquivos compilados e distribuíveis
│   ├── veritas-sdk.cjs.js         # Versão CommonJS
│   ├── veritas-sdk.cjs.js.map     # Source map para CommonJS
│   ├── veritas-sdk.esm.js         # Versão ECMAScript Modules
│   ├── veritas-sdk.esm.js.map     # Source map para ESM
│   ├── veritas-sdk.umd.js         # Versão Universal Module Definition
│   ├── veritas-sdk.umd.js.map     # Source map para UMD
│   ├── veritas-sdk.umd.min.js     # Versão UMD minificada para produção
│   └── veritas-sdk.umd.min.js.map # Source map para versão minificada
├── docs/                          # Documentação do projeto
│   └── README.md
├── example/                       # Exemplos de uso simplificados
│   ├── test-browser.html          # Exemplo de uso no navegador
│   ├── test-commonjs.js           # Exemplo de uso CommonJS
│   └── test-node.js               # Exemplo de uso Node.js
├── src/                           # Código-fonte principal da SDK
│   ├── frontend/                  # Módulos para coleta de dados no navegador
│   │   ├── BehaviorCollector.js   # Coleta especializada de eventos comportamentais
│   │   ├── collector.js           # Módulo principal de coleta de dados do navegador
│   │   ├── crypt.js               # Funções de hashing e criptografia (HMAC)
│   │   ├── index.js               # Core da SDK para o frontend
│   │   ├── sender.js              # Conector para envio de dados ao backend
│   │   └── utils.js               # Funções utilitárias
│   └── server/                    # Módulos completos para o lado do servidor
│       ├── core/                  # Núcleo do sistema de avaliação
│       │   ├── default-rules.json # Arquivo com regras padrão pré-configuradas
│       │   ├── risk.js            # Motor de avaliação de risco
│       │   └── rule.js            # Gerenciador de regras personalizáveis
│       ├── index.js               # Entry point principal do servidor
│       ├── middlewares/           # Middlewares Express.js
│       │   └── veritas.js         # Middleware principal para integração
│       ├── package.json           # Dependências específicas do servidor
│       ├── package-lock.json      # Lock file do servidor
│       └── routes/                # Rotas HTTP do servidor
│           └── identity.js        # Endpoints de verificação de identidade
├── types/                         # Definições de tipos TypeScript
│   ├── index.d.ts                 # Tipos principais da SDK
│   ├── risk.d.ts                  # Tipos para sistema de risco
│   └── rules.d.ts                 # Tipos para sistema de regras
├── jest.config.cjs                # Configuração do framework de testes
├── package.json                   # Metadados do projeto e dependências principais
├── package-lock.json              # Gerenciamento de dependências (npm)
└── rollup.config.js               # Configurações para compilação e minificação da SDK
```

Esta organização modular permite que os desenvolvedores utilizem apenas os componentes necessários, seja apenas o frontend para integração com APIs existentes, ou a solução completa incluindo o backend integrado.

## Instalação

A Veritas SDK pode ser facilmente integrada ao seu projeto, seja via CDN para uso direto no navegador ou através de gerenciadores de pacotes para ambientes Node.js.

### Via CDN (Content Delivery Network)

Para incluir a SDK diretamente em seu HTML, você pode utilizar as versões disponíveis via CDN. Recomenda-se a versão minificada para ambientes de produção para otimizar o tempo de carregamento.

```html
<!-- Versão minificada para produção -->
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.min.js"></script>

<!-- Versão de desenvolvimento (não minificada) -->
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.js"></script>
```

### Via Gerenciador de Pacotes (em breve)

Para projetos Node.js ou que utilizam bundlers como Webpack ou Rollup, você pode instalar a SDK usando npm ou Yarn.

#### npm
```bash
npm install @veritas/veritas-sdk
```

#### Yarn
```bash
yarn add @veritas/veritas-sdk
```

Após a instalação, a SDK estará disponível para ser importada e utilizada em seu código JavaScript/TypeScript, tanto para frontend quanto para backend.

## Uso - Frontend

A Veritas SDK oferece diferentes formas de inicialização e uso no frontend, dependendo do ambiente e da arquitetura do projeto.

### No Navegador (via CDN)

Ao carregar a SDK via CDN, a classe `Veritas` e a função `initSDK` são expostas globalmente, permitindo uma inicialização direta no script do seu HTML.

```html
<script src="https://cdn.jsdelivr.net/npm/@veritas/veritas-sdk@1.0.0/dist/veritas-sdk.umd.min.js"></script>
<script>
  // Inicialização da SDK com opções básicas
  const sdk = Veritas.initSDK({
    endpoint: 'https://sua-api.com/identity/verify', // URL do seu endpoint de verificação
    secret: 'sua-chave-secreta',                    // Chave secreta para HMAC (opcional, mas recomendado)
    debug: true                                     // Ativa logs de depuração no console
  });

  // Exemplo de verificação de risco para uma ação específica (e.g., login)
  sdk.checkRisk({ action: 'login', userId: '123' })
    .then(result => {
      console.log('Decisão:', result.decision);        // Possíveis valores: 'allow', 'review', 'deny'
      console.log('Score de Risco:', result.score);
      console.log('Regras Acionadas:', result.triggeredRules); // Novas informações sobre regras aplicadas
      console.log('Ações Recomendadas:', result.recommendedActions);
    })
    .catch(error => {
      console.error('Erro na verificação de risco:', error);
    });
</script>
```

### No Node.js (ESM - ECMAScript Modules)

Para projetos Node.js que utilizam a sintaxe `import`/`export` (ESM), a SDK pode ser importada como um módulo.

```javascript
import { Veritas, initSDK } from '@veritas/veritas-sdk';

// Inicialização da SDK
const sdk = new Veritas({
  endpoint: 'https://sua-api.com/identity/verify',
  secret: 'sua-chave-secreta',
  autoCollect: false // Desabilita a coleta automática de dados no servidor, se necessário
});

await sdk.init(); // Inicializa os coletores de dados

// Exemplo de coleta manual de dados
const data = await sdk.collect();
console.log('Dados coletados:', data);

// Exemplo de coleta específica de comportamento usando o novo BehaviorCollector
const behaviorData = await sdk.collectBehavior();
console.log('Dados comportamentais:', behaviorData);

// Exemplo de envio de dados coletados para o backend
const result = await sdk.send(data);
console.log('Resultado do envio:', result);
```

### No Node.js (CommonJS)

Para projetos Node.js que utilizam a sintaxe `require` (CommonJS), a SDK pode ser importada da seguinte forma:

```javascript
const { AntifraudSDK } = require('@veritas/veritas-sdk');

// Inicialização da SDK
const sdk = new AntifraudSDK({
  endpoint: 'https://sua-api.com/identity/verify',
  secret: 'sua-chave-secreta'
});

sdk.init(); // Inicializa os coletores de dados

// Exemplo de uso (similar ao ESM, mas com a sintaxe CommonJS)
// ... (coleta e envio de dados conforme exemplos acima)
```

É importante notar que a `AntifraudSDK` é o nome da classe principal para compatibilidade com CommonJS, enquanto `Veritas` é o nome da classe para ESM e uso no navegador. Ambas oferecem a mesma funcionalidade.

## Uso - Backend/Servidor

A nova arquitetura da Veritas SDK inclui um sistema completo de backend com servidor Express.js, sistema de regras e avaliação de risco integrada.

### Servidor Standalone

Você pode utilizar o servidor Veritas como uma aplicação independente:

```bash
npm install
npm start
```

### Integração com Express Existente (em breve)

Para integrar com uma aplicação Express.js existente, utilize o middleware:

```javascript
const express = require('express');
const { VeritasMiddleware, RiskEngine } = require('@veritas/veritas-sdk/server');

const app = express();

// Configurar middleware Veritas
app.use('/api/veritas', VeritasMiddleware({
  secret: 'sua-chave-secreta',
  rulesPath: './custom-rules.json', // Opcional
  enableCORS: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por janela
  }
}));

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

### Sistema de Regras (em desenvolvimento)

O novo sistema de regras permite configuração avançada de critérios de avaliação:

```javascript
const { RuleManager } = require('@veritas/veritas-sdk/core/rule');
const { RiskEvaluationEngine } = require('@veritas/veritas-sdk/core/risk');

// Inicializa o gerenciador de regras e o motor de avaliação de risco
const ruleManager = new RuleManager("./rules.json");

// Adicionar nova regra
await ruleManager.addRule({
  id: 'high_risk_behavior',
  name: 'Comportamento de Alto Risco',
  description: "Avaliação de comportamento do mouse"
  expression: "behavior && behavior.clickFrequency > 0.5",
  action: "deny"
});

// Atualizar regra existente
await ruleManager.updateRule('existing_rule_id', {
  expression: "new condition"
});

// Usar motor de risco com regras atualizadas
const riskEngine = new RiskEngine({
  ruleManager: ruleManager
});
```

## Configuração da SDK

A SDK Veritas é altamente configurável, permitindo que você ajuste seu comportamento para atender às necessidades específicas da sua aplicação. As opções de configuração são passadas durante a inicialização da SDK.

### Opções do Frontend

As seguintes opções podem ser configuradas para o frontend:

```javascript
// Configurar opções de coleta. Por definição Plugins, Storage e Behavior não são coletados.
sdk.configureCollect({
    collectPlugins: false,
    collectStorage: true,
    collectBehavior: true
});
```

### Métodos Principais da SDK

A SDK Veritas expõe uma série de métodos para interagir com suas funcionalidades de coleta e envio de dados:

```javascript
// Inicializar a SDK com as opções desejadas
const sdk = new AntifraudSDK(options); // Ou `new Veritas(options)` para ESM/Browser
await sdk.init(); // **Importante**: Este método deve ser chamado para iniciar os coletores de dados e listeners de comportamento.

// Coletar dados do dispositivo e comportamento do usuário manualmente
const data = sdk.collect();

// Nova funcionalidade: Coletar especificamente dados comportamentais
const behaviorData = sdk.collectBehavior();

// Enviar dados coletados para o endpoint do backend
const result = await sdk.send(data);

// Coletar e enviar dados em uma única chamada (combinação de `collect` e `send`)
const result = await sdk.collectAndSend();

// Verificar o risco de uma ação específica, combinando coleta e envio com dados adicionais da ação
const result = await sdk.checkRisk({ 
  action: 'purchase', 
  amount: 100, 
  userId: 'user123',
  customData: { /* dados específicos da aplicação */ }
});

// Reconfigurar opções da SDK em tempo de execução
sdk.configure({ 
  endpoint: 'http://localhost:3000/identity/verify',
  secret: 'test-secret-key',
  debug: true,
  collectInterval: 300,
  autoCollect: false
});

// Destruir a instância da SDK e remover todos os listeners de eventos
sdk.destroy();
```

Estes métodos fornecem controle granular sobre o processo de coleta e envio de dados, permitindo que os desenvolvedores integrem a SDK de forma flexível em suas aplicações.

## Sistema de Regras Avançado

A nova versão da Veritas SDK inclui um sistema de regras robusto que permite configuração detalhada dos critérios de avaliação de risco.

### Estrutura das Regras Padrão

O arquivo `default-rules.json` contém regras pré-configuradas que podem ser usadas como base:

```json
[
  {
    "id": "fingerprint",
    "name": "Fingerprint Check",
    "description": "Verifica se há fingerprint de canvas disponível",
    "expression": "fingerprint && fingerprint !== 'unavailable'",
    "weight": 150,
    "action": "allow"
  },
  {
    "id": "suspicious_user_agent",
    "name": "Suspicious User Agent",
    "description": "Detecta user agents suspeitos",
    "expression": "browser.userAgent.includes('bot') || browser.userAgent.includes('spider') || browser.userAgent.includes('scraper') || browser.userAgent.includes('curl') || browser.userAgent.includes('crawler')",
    "weight": -30,
    "action": "review"
  },
  {
    "id": "facial_verification",
    "name": "Facial Verification",
    "description": "Bonus por verificação facial bem-sucedida",
    "expression": "facial && facial.imageData && !facial.error",
    "weight": 25,
    "action": "allow"
  },
  {
    "id": "high_behavioral_frequency",
    "name": "High Behavioral Frequency",
    "description": "Detecta atividade comportamental anormalmente alta",
    "expression": "behavior && behavior.clickFrequency > 0.5",
    "weight": -10,
    "action": "review"
  }
]
```

## Dados Coletados pela SDK

A Veritas SDK foi projetada para coletar uma gama abrangente de dados de forma passiva e não intrusiva, fornecendo informações valiosas para a detecção de fraudes. A coleta é realizada com foco na privacidade, evitando a captura de conteúdo sensível como senhas ou textos digitados.

### Categorias de Dados Coletados:

1. **Informações do Navegador:**
   * `User Agent`: Identificação do navegador e sistema operacional.
   * `language` e `languages`: Idioma preferencial do navegador e lista de idiomas configurados.
   * `cookieEnabled`: Status da habilitação de cookies no navegador.
   * `doNotTrack`: Preferência do usuário para rastreamento (se ativada).
   * `hardwareConcurrency`: Número de núcleos lógicos do processador disponíveis.
   * `maxTouchPoints`: Número máximo de pontos de toque simultâneos suportados.
   * `plugins`: Lista de plugins instalados no navegador.

2. **Informações da Tela:**
   * `width` e `height`: Resolução total da tela em pixels.
   * `availWidth` e `availHeight`: Resolução disponível da tela (excluindo barras de ferramentas do sistema).
   * `colorDepth` e `pixelDepth`: Profundidade de cor da tela.
   * `orientation`: Orientação atual da tela (e.g., `portrait-primary`, `landscape-secondary`).
   * `devicePixelRatio`: Relação entre pixels físicos e pixels CSS.

3. **Fingerprinting Avançado:**
   * **Canvas Fingerprint**: Um hash único gerado a partir da renderização de elementos gráficos em um canvas HTML. Varia ligeiramente entre dispositivos devido a diferenças de hardware, drivers e software, criando uma "impressão digital" do dispositivo.
   * **WebGL Fingerprint**: Informações detalhadas sobre a GPU (Unidade de Processamento Gráfico) do dispositivo, incluindo fabricante, modelo e capacidades. Utilizado para identificar dispositivos de forma mais precisa.
   * **Audio Fingerprint**: Características únicas do contexto de áudio do dispositivo, que podem ser usadas para diferenciar máquinas.

4. **Comportamento do Usuário (Coletado via BehaviorCollector):**
   * **Movimentos do Mouse**: Coordenadas, velocidade, aceleração e padrões de movimento do cursor. Não captura o conteúdo clicado, apenas a trajetória e características do movimento.
   * **Eventos de Teclado**: Registro de eventos de pressionamento de teclas com análise temporal. Não captura o texto digitado, apenas padrões de digitação e timing.
   * **Eventos de Foco e Scroll**: Monitoramento de quando a janela ou elementos específicos ganham/perdem foco, padrões de rolagem da página e comportamento de navegação.
   * **Eventos de Toque (Mobile)**: Para dispositivos móveis, coleta padrões de toque, gestos e interações específicas de touch.
   * **Tempo de Permanência**: Duração da interação do usuário com a página, tempo entre ações e padrões de atividade/inatividade.

5. **Metadados e Contexto:**
   * `timezone` e `timezoneOffset`: Informações sobre o fuso horário local do usuário.
   * `locale`: Configurações regionais do navegador.
   * `timestamp`: Carimbo de data/hora da coleta dos dados.
   * `sessionId`: Um identificador de sessão único gerado pela SDK para correlacionar eventos.
   * `storage`: Capacidades e disponibilidade de localStorage, sessionStorage e IndexedDB.
   * `network`: Informações sobre a conexão de rede quando disponíveis.

Todos esses dados são coletados de forma a não comprometer a privacidade do usuário, focando em características do dispositivo e padrões de interação que são relevantes para a análise de risco, sem acessar informações pessoais diretas.

## Segurança

A segurança é um pilar fundamental da Veritas SDK, que incorpora diversas medidas para proteger a integridade dos dados e a privacidade do usuário:

* **Assinatura HMAC (Hash-based Message Authentication Code)**: Todos os dados enviados ao backend podem ser assinados digitalmente usando HMAC-SHA256. Isso garante que os dados não foram alterados em trânsito e que a requisição realmente se originou da SDK, protegendo contra adulteração e ataques de replay. A chave secreta para a assinatura é configurável.

* **Coleta Passiva e Não Intrusiva**: A SDK é projetada para coletar dados de forma passiva, ou seja, sem interagir diretamente com o conteúdo sensível digitado pelo usuário (como senhas, números de cartão de crédito ou informações pessoais em campos de formulário). O foco está em metadados do dispositivo e padrões de comportamento, não no conteúdo.

* **Configurabilidade e Controle Granular**: Todas as funcionalidades de coleta de dados podem ser configuradas e, se necessário, desabilitadas individualmente. Isso permite que os desenvolvedores tenham controle total sobre quais informações são coletadas e quando, adaptando a SDK às políticas de privacidade e requisitos regulatórios de cada aplicação.

* **Sistema de Regras Seguro**: O motor de regras opera com validação de entrada e sanitização de dados, prevenindo ataques de injeção e garantindo que apenas regras válidas sejam processadas. As regras são validadas tanto em estrutura quanto em lógica antes da aplicação.

* **Rate Limiting Integrado**: O backend inclui proteção contra ataques de negação de serviço (DoS) através de rate limiting configurável, limitando o número de requisições por janela de tempo por IP ou identificador.

* **Logs de Auditoria**: O sistema de backend mantém logs detalhados de todas as avaliações de risco, regras aplicadas e decisões tomadas, permitindo auditoria e análise posterior para compliance e melhoria contínua.

Essas características de segurança garantem que a Veritas SDK não apenas ajude a identificar atividades fraudulentas, mas também o faça de maneira segura e responsável, protegendo tanto a aplicação quanto os dados dos usuários.

## Integração Backend

A Veritas SDK é projetada para funcionar tanto com seu sistema backend integrado quanto para integração com APIs existentes. A nova arquitetura oferece flexibilidade total para diferentes cenários de implementação.

### Sistema Backend Integrado

O backend completo da Veritas inclui um servidor Express.js com todas as funcionalidades necessárias:


### Exemplos de Teste

Os arquivos na pasta `example/` demonstram diferentes cenários de uso:

- **`test-browser.html`**: Exemplo completo de integração no navegador com interface de teste
- **`test-node.js`**: Exemplo de uso em ambiente Node.js com ESM
- **`test-commonjs.js`**: Exemplo de uso com sintaxe CommonJS

## Licença

A Veritas SDK é distribuída sob a licença MIT. Isso significa que você é livre para usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do software, desde que inclua o aviso de direitos autorais e esta permissão em todas as cópias ou partes substanciais do software.

© 2025 Veritas

## Suporte

Para dúvidas, problemas ou sugestões relacionadas à Veritas SDK:

### 📚 Documentação
- Consulte a documentação técnica completa na pasta `/docs`
- Exemplos práticos disponíveis na pasta `/example`
- Definições de tipos TypeScript em `/types`

### 🐛 Reportar Problemas
- Crie uma issue no repositório GitHub do projeto
- Inclua informações detalhadas sobre o ambiente e passos para reproduzir

### 💬 Suporte Técnico
- Entre em contato com a equipe de desenvolvimento Veritas
- Para questões de integração, consulte os exemplos fornecidos
- Para dúvidas sobre o sistema de regras, consulte a documentação do `RuleManager`

### 🔄 Atualizações
- Monitore o repositório para novas versões e funcionalidades
- Consulte o changelog para informações sobre mudanças e melhorias
- Teste sempre em ambiente de desenvolvimento antes de atualizar em produção

Estamos à disposição para auxiliar na integração e no uso da SDK Veritas, garantindo que sua aplicação tenha a melhor proteção antifraude possível.

---

**Desenvolvido com ❤️ para FIAP x HAKAI**