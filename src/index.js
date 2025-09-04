import { collectData } from './collector.js';
import { sendToBackend } from './sender.js';
export { createHmac, verifyHmac } from './crypt.js';
export { evaluateRisk, riskDecision } from './risk.js';

// Classe principal da SDK
export class Veritas {
  constructor(options = {}) {
    this.options = options;
  }
  collect() { return collectData(); }
  async send(data) { return sendToBackend(data, this.options); }
  async collectAndSend() {
    const data = this.collect();
    return this.send(data);
  }
  async checkRisk(actionData) {
    const data = this.collect();
    data.action = actionData;
    const response = await this.send(data);
    return await response.json();
  }
  startAutoCollection() {}
  stopAutoCollection() {}
  configure(newOptions) { Object.assign(this.options, newOptions); }
  destroy() {}
}

// Função de conveniência
export function init(options = {}) {
  const sdk = new Veritas(options);
  return sdk;
}

// Export default para compatibilidade
export default Veritas;