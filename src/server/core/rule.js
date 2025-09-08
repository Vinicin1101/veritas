/**
 * Gerenciador de Regras de Avaliação de Risco
 */

import { promises as fs } from "fs";
import path from "path";

/**
 * @typedef {import("../../../types/rules").RuleDefinition} RuleDefinition
 * @typedef {import("../../../types/rules").Thresholds} Thresholds
 * @typedef {import("../../../types/rules").RuleExecutionResult} RuleExecutionResult
 * @typedef {import("../../../types/rules").InputContext} InputContext
 * @typedef {import("../../../types/rules").RunOptions} RunOptions
 * @typedef {import("../../../types/rules").RuleConfig} RuleConfig
 * @typedef {import("../../../types/rules").RuleStats} RuleStats
 */

/**
 * Classe que gerencia regras de avaliação de risco.
 */
class RuleManager {
  /**
   * @param {string} rulesFile Caminho do arquivo de definição de regras
   */
  constructor(rulesFile) {
    /** @type {string} */
    this.rulesFile = rulesFile;

    /** @type {RuleDefinition[]} */
    this.ruleSet = [];

    /** @type {Thresholds} */
    this.thresholds = {
      allow: 70,
      review: 45,
      deny: 10,
    };
  }

  /**
   * Carrega definição de regras de um arquivo JSON.
   * @returns {Promise<void>}
   */
  async loadConfig() {
    try {
      const fileContent = await fs.readFile(this.rulesFile, "utf8");
      /** @type {Partial<RuleConfig>} */
      const config = JSON.parse(fileContent);
      this.ruleSet = config.rules || [];
      this.thresholds = config.thresholds || this.thresholds;
      this.lastUpdate = new Date().toISOString();
      console.log(
        `[RuleManager] Regras carregadas de ${this.rulesFile}: ${this.ruleSet.length}`
      );
      this._checkRules();
    } catch (err) {
      console.warn(
        `[RuleManager] Falha ao carregar regras, certifique o arquivo: ${err.message}`
      );
    }
  }

  /**
   * Valida estrutura das regras.
   * @private
   */
  _checkRules() {
    for (const rule of this.ruleSet) {
      if (
        !rule.id ||
        !rule.name ||
        !rule.condition ||
        typeof rule.weight !== "number" ||
        !rule.action
      ) {
        throw new Error(`Regra inválida: ${JSON.stringify(rule)}`);
      }
      if (!["allow", "review", "deny"].includes(rule.action)) {
        throw new Error(`Ação inválida na regra: ${rule.action}`);
      }
    }
  }

  /**
   * Executa regras sobre os dados fornecidos.
   * @param {InputContext} inputData Dados para avaliação
   * @param {RunOptions} [options] Opções de execução
   * @returns {Promise<RuleExecutionResult[]>}
   */
  async runRules(inputData, options = {}) {
    let rulesToRun = this.ruleSet.filter((rule) => rule.enabled);

    if (options.ruleId) {
      rulesToRun = rulesToRun.filter((rule) => rule.id === options.ruleId);
    }

    /** @type {RuleExecutionResult[]} */
    const results = [];
    for (const rule of rulesToRun) {
      try {
        const result = await this._runRule(rule, inputData);
        results.push(result);
      } catch (err) {
        console.error(`[RuleManager] Erro ao executar regra ${rule.id}:`, err);
        results.push({
          id: rule.id,
          name: rule.name,
          passed: false,
          weight: 0,
          score: 0,
          error: err.message,
        });
      }
    }
    return results;
  }

  /**
   * Executa uma regra.
   * @private
   * @param {RuleDefinition} rule
   * @param {InputContext} inputData
   * @returns {Promise<RuleExecutionResult>}
   */
  async _runRule(rule, inputData) {
    const context = this._buildContext(inputData);
    const passed = this._testCondition(rule.condition, context);
    const score = passed ? rule.weight : 0;
    return {
      id: rule.id,
      name: rule.name,
      passed,
      weight: rule.weight,
      score,
      action: rule.action,
      expression: rule.expression,
      description: rule.description,
    };
  }

  /**
   * Monta contexto seguro para avaliação.
   * @private
   * @param {InputContext} inputData
   * @returns {InputContext}
   */
  _buildContext(inputData) {
    return {
      fingerprint: inputData.fingerprint || {},
      behavior: inputData.behavior || {},
      sessionId: inputData.sessionId,
      timestamp: inputData.timestamp,
    };
  }

  /**
   * Avalia a condição de uma regra.
   * @private
   * @param {string} condition
   * @param {InputContext} context
   * @returns {boolean}
   */
  _testCondition(condition, context) {
    try {
      const func = new Function(
        "context",
        `
        const { fingerprint, behavior, facial, sessionId, timestamp } = context;
        return ${condition};
      `
      );
      return Boolean(func(context));
    } catch (err) {
      console.error(
        "[RuleManager] Erro ao avaliar condição:",
        condition,
        err
      );
      return false;
    }
  }

  /**
   * Retorna configuração atual.
   * @returns {RuleConfig}
   */
  getConfig() {
    return {
      rules: this.ruleSet,
      thresholds: this.thresholds,
      rulesFile: this.rulesFile,
    };
  }

  /**
   * Recarrega regras do arquivo.
   * @returns {Promise<void>}
   */
  async reload() {
    await this.loadConfig();
    console.log("[RuleManager] Regras recarregadas");
  }

  /**
   * Retorna estatísticas das regras.
   * @returns {RuleStats}
   */
  getStats() {
    const enabled = this.getEnabledRules();
    return {
      total: this.ruleSet.length,
      enabled: enabled.length,
      byAction: {
        allow: this.getRulesByType("allow").length,
        review: this.getRulesByType("review").length,
        deny: this.getRulesByType("deny").length,
      },
      byWeight: {
        positive: enabled.filter((r) => r.weight > 0).length,
        negative: enabled.filter((r) => r.weight < 0).length,
        neutral: enabled.filter((r) => r.weight === 0).length,
      },
      lastUpdate: this.lastUpdate,
    };
  }

  /**
   * @private
   * @returns {RuleDefinition[]}
   */
  getEnabledRules() {
    return this.ruleSet.filter((r) => r.enabled);
  }

  /**
   * @private
   * @param {string} action
   * @returns {RuleDefinition[]}
   */
  getRulesByType(action) {
    return this.ruleSet.filter((r) => r.action === action);
  }
}

export { RuleManager };
