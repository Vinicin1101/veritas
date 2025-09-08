import { isNode, isBrowser } from './utils.js';

// HMAC para browser
async function browserHmac(message, secret) {
  if (!crypto || !crypto.subtle) {
    throw new Error('Web Crypto API não disponível');
  }
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// HMAC para Node.js
async function nodeHmac(message, secret) {
  try {
    let crypto;
    if (typeof require !== 'undefined') {
      // CommonJS
      crypto = require('crypto');
    } else if (typeof process !== 'undefined' && process.versions?.node) {
      // ESM
      crypto = (await import('crypto')).default;
    }
    if (crypto?.createHmac) {
      return crypto.createHmac('sha256', secret).update(message).digest('base64');
    } else {
      throw new Error('createHmac não disponível');
    }
  } catch (error) {
    throw new Error('Módulo crypto do Node.js não disponível');
  }
}

// Função universal para HMAC
export async function createHmac(message, secret) {
  if (isBrowser()) {
    return await browserHmac(message, secret);
  } else if (isNode()) {
    return nodeHmac(message, secret);
  } else {
    throw new Error('Ambiente não suportado para HMAC');
  }
}

// Verificação de assinatura
export async function verifyHmac(message, signature, secret) {
  try {
    const expectedSignature = await createHmac(message, secret);
    return expectedSignature === signature;
  } catch (error) {
    return false;
  }
}

