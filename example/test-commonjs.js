// Teste do SDK usando CommonJS (require)
const { AntifraudSDK } = require('../../dist/antifraud-sdk.cjs.js');

console.log('🔒 Testando SDK Antifraude com CommonJS\n');

console.log('1. Testando require...');
try {
    const sdk = new AntifraudSDK({
        endpoint: 'http://localhost:3000/identity/verify',
        secret: 'test-secret-key',
        debug: true,
        autoCollect: false
    });
    
    sdk.init();
    console.log('✅ SDK carregado via require');
    
    const data = sdk.collect();
    console.log('✅ Dados coletados via CommonJS');
    
    sdk.destroy();
    console.log('✅ Teste CommonJS concluído');
    
} catch (error) {
    console.error('❌ Erro no teste CommonJS:', error.message);
}

console.log('\n🎉 Teste CommonJS finalizado!');

