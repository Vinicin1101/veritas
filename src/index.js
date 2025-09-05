import { collectData } from './collector.js';
import { sendToBackend } from './sender.js';
export { createHmac, verifyHmac } from './crypt.js';


/**
 * @typedef {Object} CollectOptions
 * @property {boolean} [collectPlugins]
 * @property {boolean} [collectStorage]
 * @property {boolean} [collectBehavior]
 */

// Classe principal da SDK
export class Veritas {
  /**
   * @param {Object} options
   * @param {CollectOptions} [options.collectOptions]
   */
  constructor(options = {}) {
    this.options = options;
    this.collectOptions = { collectPlugins: false, collectStorage: false, collectBehavior: false, ...(options.collectOptions || {}) };
  }

  /**
   * @param {CollectOptions} CollectOptions
   */
  configureCollect(options = {}) {
    this.collectOptions = { ...this.collectOptions, ...options };
  }

  async collect() {
    return await collectData(this.collectOptions);
  }

  async send(data) {
    return await sendToBackend(data, this.options);
  }

  async collectAndSend() {
    const data = await this.collect();
    return await this.send(data);
  }

  async checkRisk(actionData) {
    const data = await this.collect();
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