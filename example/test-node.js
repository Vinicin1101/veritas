// Teste do SDK em ambiente Node.js
import { Veritas, init, createHmac, verifyHmac } from '../dist/veritas-sdk.esm.js';
import 'crypto';

console.log('🔒 Testando SDK Antifraude em Node.js\n');

// Teste 1: Inicialização básica
console.log('1. Testando inicialização básica...');
try {
    const sdk = new Veritas();

    sdk.configure({
        endpoint: 'http://localhost:3000/identity/verify',
        secret: 'test-secret-key',
        debug: true,
        autoCollect: false // Desabilitar coleta automática no servidor
    });
    console.log('✅ SDK inicializado com sucesso');


    // Teste 2: Coleta de dados (não aplicável no Node.js por enquanto)
    //console.log('\n2. Testando coleta de dados...');
    //const data = sdk.collect();
    //console.log('✅ Dados coletados:', JSON.stringify(data, null, 2));


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
console.log('\n5. Testando função init...');
try {
    const sdk2 = init({
        endpoint: 'http://localhost:3000/identity/verify',
        debug: true,
        autoCollect: false
    });
    console.log('✅ init funcionou');

    sdk2.destroy();
} catch (error) {
    console.error('❌ Erro no init:', error.message);
}

// Teste 6: Importação de módulos específicos
console.log('\n6. Testando importações específicas...');
try {
    
    // Teste 7: Testar HMAC
    createHmac('test message', 'secret').then(signature => {
        console.log('✅ HMAC criado:', signature);
        
        // Teste 8: Verificar HMAC
        verifyHmac('test message', signature, 'secret').then(isValid => {
            console.log('✅ HMAC verificado:', isValid);
        });
    });
    console.log('✅ Módulo crypt importado');

} catch (error) {
    console.error('❌ Erro na importação:', error.message);
}

