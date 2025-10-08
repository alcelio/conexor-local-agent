// print-agent-local/src/config/ConfigManager.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * MÓDULO: Gerenciamento de configuração do Print Agent
 * Responsável por carregar, salvar e sincronizar configurações com o backend
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { extractEstacaoIdFromApiKey } = require('../utils/textNormalizer');

const CONFIG_FILE = path.join(__dirname, '../../config.json');

class ConfigManager {
  /**
   * Carrega configuração do arquivo config.json
   *
   * @returns {Object|null} Configuração carregada ou null se não existir/erro
   */
  static loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        const savedConfig = JSON.parse(data);

        // EXTRAIR AUTOMATICAMENTE O ESTACAO_ID DA API KEY
        if (savedConfig.PRINT_AGENT_API_KEY && !savedConfig.ESTACAO_ID) {
          savedConfig.ESTACAO_ID = extractEstacaoIdFromApiKey(savedConfig.PRINT_AGENT_API_KEY);
          console.log(`🔑 [CONFIG] ESTACAO_ID extraído automaticamente: ${savedConfig.ESTACAO_ID}`);
        }

        console.log('📁 [CONFIG] Configuração carregada de config.json');
        return savedConfig;
      }
    } catch (error) {
      console.warn('⚠️ [CONFIG] Erro ao ler config.json:', error.message);
    }
    return null;
  }

  /**
   * Salva configuração no arquivo config.json
   *
   * @param {Object} config - Objeto de configuração a ser salvo
   * @returns {boolean} true se sucesso, false se erro
   */
  static saveConfig(config) {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
      console.log('💾 [CONFIG] Configuração salva em config.json');
      return true;
    } catch (error) {
      console.error('❌ [CONFIG] Erro ao salvar config.json:', error.message);
      return false;
    }
  }

  /**
   * Sincronizar configuração da impressora com o backend
   * Atualiza o registro da caixa no banco de dados com as informações USB
   *
   * @param {Object} config - Configuração completa contendo PRINTER, ESTACAO_ID, etc
   * @returns {Promise<Object>} Resposta do backend
   * @throws {Error} Se configuração incompleta ou erro na requisição
   */
  static async syncPrinterConfigToBackend(config) {
    if (!config.PRINTER || !config.PRINTER.vendorId || !config.PRINTER.productId) {
      throw new Error('Configuração da impressora incompleta');
    }

    if (!config.ESTACAO_ID || !config.PRINT_AGENT_API_KEY) {
      throw new Error('ESTACAO_ID ou API_KEY não configurados');
    }

    const url = `${config.BACKEND_URL}/api/erp/caixas-agent/estacao/${config.ESTACAO_ID}/printer-config`;

    const payload = {
      vendorId: config.PRINTER.vendorId,
      productId: config.PRINTER.productId,
      interface: config.PRINTER.interface,
      endpoint: config.PRINTER.endpoint
    };

    console.log(`🔄 [SYNC] PUT ${url}`);
    console.log('📤 [SYNC] Payload:', payload);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Print-Agent-Key': config.PRINT_AGENT_API_KEY
      },
      body: JSON.stringify(payload),
      timeout: config.HTTP_TIMEOUT || 10000
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend retornou ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [SYNC] Backend respondeu:', result);

    return result;
  }
}

module.exports = ConfigManager;
