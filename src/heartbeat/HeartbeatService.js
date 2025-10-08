// print-agent-local/src/heartbeat/HeartbeatService.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * MÓDULO: Serviço de Heartbeat Adaptivo
 * Envia status periódico ao backend (10s idle, 5s durante impressão)
 */

const fetch = require('node-fetch');

class HeartbeatService {
  /**
   * @param {Object} config - Configuração do Print Agent
   * @param {Object} usbHandler - Handler de impressora USB (para checkPrinterStatus)
   */
  constructor(config, usbHandler) {
    this.config = config;
    this.usbHandler = usbHandler;
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 10000; // 10s idle
    this.isActivePrinting = false;
  }

  /**
   * Envia heartbeat ao backend com status atual
   */
  async sendHeartbeat() {
    try {
      if (!this.config.PRINT_AGENT_API_KEY) {
        console.warn('⚠️ [HEARTBEAT] API Key não configurada');
        return;
      }

      // Verificar status da impressora
      const printerStatus = await this.usbHandler.checkPrinterStatus();

      const heartbeatData = {
        printer_connected: printerStatus.connected,
        printer_vendor_id: this.config.PRINTER?.vendorId || null,
        printer_product_id: this.config.PRINTER?.productId || null,
        printer_name: printerStatus.name || null,
        printer_status: printerStatus.status || 'UNKNOWN',
        agent_version: '2.0',
        agent_platform: process.platform,
        error: printerStatus.error || null
      };

      const response = await fetch(`${this.config.BACKEND_URL}/api/erp/print-agent/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Print-Agent-API-Key': this.config.PRINT_AGENT_API_KEY
        },
        body: JSON.stringify(heartbeatData),
        timeout: this.config.HTTP_TIMEOUT
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`💓 [HEARTBEAT] Enviado - Online: ${result.data?.is_online}, Jobs hoje: ${result.data?.jobs_processed_today}`);
      } else {
        console.warn(`⚠️ [HEARTBEAT] Falhou: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`⚠️ [HEARTBEAT] Erro ao enviar:`, error.message);
    }
  }

  /**
   * Ajusta intervalo de heartbeat (adaptivo)
   * 5s durante impressão ativa, 10s em idle
   *
   * @param {boolean} isActive - Se está imprimindo ativamente
   */
  setHeartbeatInterval(isActive) {
    if (isActive === this.isActivePrinting) return; // Sem mudança

    this.isActivePrinting = isActive;
    const newInterval = isActive ? 5000 : 10000;

    if (newInterval === this.heartbeatIntervalMs) return; // Mesmo intervalo

    // Reconfigurar interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatIntervalMs = newInterval;
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);

    console.log(`🔄 [HEARTBEAT] Intervalo ajustado para ${this.heartbeatIntervalMs / 1000}s (${isActive ? 'ATIVO' : 'IDLE'})`);
  }

  /**
   * Inicia o serviço de heartbeat
   *
   * @param {number} initialDelay - Delay inicial antes do primeiro heartbeat (ms)
   */
  start(initialDelay = 3000) {
    console.log(`💓 [HEARTBEAT] Iniciando serviço (intervalo: ${this.heartbeatIntervalMs / 1000}s)`);

    // Primeiro heartbeat após delay inicial
    setTimeout(() => this.sendHeartbeat(), initialDelay);

    // Heartbeats periódicos
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
  }

  /**
   * Para o serviço de heartbeat
   */
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('🛑 [HEARTBEAT] Serviço parado');
    }
  }
}

module.exports = HeartbeatService;
