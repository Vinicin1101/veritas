// Teste do SDK em ambiente Node.js
import { Veritas, initSDK } from '../../dist/veritas-sdk.esm.js';

console.log('🔒 Testando SDK Antifraude em Node.js\n');

// Teste 1: Inicialização básica
console.log('1. Testando inicialização básica...');
try {
    const sdk = new Veritas({
        endpoint: 'http://localhost:3000/identity/verify',
        secret: 'test-secret-key',
        debug: true,
        autoCollect: false // Desabilitar coleta automática no servidor
    });

    sdk.init();
    console.log('✅ SDK inicializado com sucesso');


    // Teste 2: Coleta de dados
    console.log('\n2. Testando coleta de dados...');
    const data = sdk.collect();
    console.log('✅ Dados coletados:', JSON.stringify(data, null, 2));


    // Teste 3: Configuração
    console.log('\n3. Testando reconfiguração...');
    sdk.configure({
        timeout: 10000,
        retries: 3
    });
    console.log('✅ SDK reconfigurado');


    // Teste 4: Destruição
    console.log('\n4. Testando destruição...');
    sdk.destroy();
    console.log('✅ SDK destruído');


} catch (error) {
    console.error('❌ Erro no teste:', error.message);
}

// Teste 5: Função de conveniência
console.log('\n5. Testando função initSDK...');
try {
    const sdk2 = initSDK({
        endpoint: 'http://localhost:3000/identity/verify',
        debug: true,
        autoCollect: false
    });
    console.log('✅ initSDK funcionou');

    sdk2.destroy();
} catch (error) {
    console.error('❌ Erro no initSDK:', error.message);
}

// Teste 6: Importação de módulos específicos
console.log('\n6. Testando importações específicas...');
try {
    import('../../src/crypt.js').then(({ createFingerprint, verifyFingerprint }) => {
        console.log('✅ Módulo crypto importado');

        // Teste 7: Testar HMAC
        createFingerprint('test message', 'secret').then(signature => {
            console.log('✅ HMAC criado:', signature);

            // Teste 8: Verificar HMAC
            verifyFingerprint('test message', signature, 'secret').then(isValid => {
                console.log('✅ HMAC verificado:', isValid);
            });
        });

    });
} catch (error) {
    console.error('❌ Erro na importação:', error.message);
}

