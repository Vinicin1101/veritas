import { createHmac } from './crypt.js';

export async function sendToBackend(data, options) {
  const signature = await createHmac(JSON.stringify(data), options.secret);

  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SDK-Signature': signature
    },
    body: JSON.stringify(data)
  });

  return response;
}
