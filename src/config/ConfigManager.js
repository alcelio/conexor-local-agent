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

// Em binário pkg, __dirname é virtual - usar process.cwd() para arquivo real
const CONFIG_FILE = process.pkg
  ? path.join(path.dirname(process.execPath), 'config.json')
  : path.join(__dirname, '../../config.json');

// Lista de endpoints discovery (tenta até achar um que funcione)
const DISCOVERY_ENDPOINTS = [
  'https://www.conexor.com.br/api/discovery/current',
  'https://simplex.tec.br/api/discovery/current',
  'https://neuroagentes-production.up.railway.app/api/discovery/current'
];

class ConfigManager {
  /**
   * Descobre automaticamente a URL do backend
   * Tenta cada endpoint da lista até encontrar um que funcione
   *
   * @returns {Promise<string>} URL do backend descoberta
   */
  static async discoverBackendUrl() {
    console.log('🔍 [DISCOVERY] Descobrindo URL do backend automaticamente...');

    for (const endpoint of DISCOVERY_ENDPOINTS) {
      try {
        console.log(`🔍 [DISCOVERY] Tentando: ${endpoint}`);
        const response = await fetch(endpoint, {
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          const backendUrl = data.backend_url;
          console.log(`✅ [DISCOVERY] Backend descoberto: ${backendUrl}`);
          return backendUrl;
        }
      } catch (error) {
        console.log(`⚠️ [DISCOVERY] Falhou: ${endpoint} (${error.message})`);
        continue; // Tenta próximo
      }
    }

    // Se nenhum funcionar, retorna primeiro da lista como fallback
    const fallback = DISCOVERY_ENDPOINTS[0].replace('/api/discovery/current', '');
    console.warn(`⚠️ [DISCOVERY] Nenhum endpoint respondeu. Usando fallback: ${fallback}`);
    return fallback;
  }

  /**
   * Cria configuração default vazia para primeira execução
   *
   * @returns {Object} Configuração default sem credenciais
   */
  static createDefaultConfig() {
    return {
      PORT: 8080,
      BACKEND_URL: "", // Será descoberto automaticamente quando salvar chave
      ESTACAO_ID: "", // Será extraído da chave automaticamente
      PRINT_AGENT_API_KEY: "", // Usuário cola via interface web
      POLLING_INTERVAL: 5000,
      HTTP_TIMEOUT: 10000,
      PRINTER: {
        vendorId: null,
        productId: null,
        interface: 0,
        endpoint: 2
      }
    };
  }

  /**
   * Carrega configuração do arquivo config.json
   * Se não existir, cria config vazio para primeira execução
   *
   * @returns {Object} Configuração carregada ou config default
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
      } else {
        // Primeira execução - criar config vazio
        console.log('🆕 [CONFIG] Primeira execução detectada - criando config vazio');
        const defaultConfig = this.createDefaultConfig();
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.warn('⚠️ [CONFIG] Erro ao ler config.json:', error.message);
      // Em caso de erro, retornar config default
      return this.createDefaultConfig();
    }
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
   * Salva configuração e descobre URL automaticamente se estiver vazia
   * Usado quando cliente cola chave de conexão pela primeira vez
   *
   * @param {Object} config - Configuração com API_KEY
   * @returns {Promise<Object>} Configuração atualizada com BACKEND_URL descoberta
   */
  static async saveConfigWithDiscovery(config) {
    // Se BACKEND_URL estiver vazio, descobrir automaticamente
    if (!config.BACKEND_URL || config.BACKEND_URL === "") {
      console.log('🔍 [CONFIG] BACKEND_URL vazia - descobrindo automaticamente...');
      config.BACKEND_URL = await this.discoverBackendUrl();
    }

    // Salvar config atualizada
    this.saveConfig(config);
    return config;
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
