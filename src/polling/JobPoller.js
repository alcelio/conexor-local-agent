// print-agent-local/src/polling/JobPoller.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * MÓDULO: Job Poller
 * Responsável por buscar e processar jobs PENDING do backend
 */

const fetch = require('node-fetch');

class JobPoller {
  /**
   * @param {Object} config - Configuração do Print Agent
   * @param {Object} usbHandler - Handler de impressora USB
   * @param {Object} heartbeatService - Serviço de heartbeat (para ajustar intervalo)
   */
  constructor(config, usbHandler, heartbeatService) {
    this.config = config;
    this.usbHandler = usbHandler;
    this.heartbeatService = heartbeatService;
    this.pollingActive = false;
    this.pollingInterval = null;
  }

  /**
   * Busca jobs PENDING do backend e processa cada um
   */
  async pollPendingJobs() {
    if (this.pollingActive) {
      console.log('⏭️ [POLLING] Já existe polling em andamento, aguardando...');
      return;
    }

    this.pollingActive = true;

    try {
      console.log(`🔄 [POLLING] Buscando jobs PENDING para estação ${this.config.ESTACAO_ID}...`);

      // Buscar jobs do backend (autenticado via X-Print-Agent-Key)
      const response = await fetch(
        `${this.config.BACKEND_URL}/api/erp/print-jobs-agent/pending/${this.config.ESTACAO_ID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Print-Agent-Key': this.config.PRINT_AGENT_API_KEY
          },
          timeout: this.config.HTTP_TIMEOUT
        }
      );

      if (!response.ok) {
        throw new Error(`Backend respondeu com status ${response.status}`);
      }

      const result = await response.json();
      const jobs = result.data?.data || [];

      console.log(`📊 [POLLING] Encontrados ${jobs.length} jobs pendentes`);

      // Processar cada job
      for (const job of jobs) {
        await this.processJob(job);
      }

    } catch (error) {
      console.error('❌ [POLLING] Erro ao buscar jobs:', error.message);
    } finally {
      this.pollingActive = false;
    }
  }

  /**
   * Processa um job individual
   *
   * @param {Object} job - Job a ser processado { id, job_number, content, printer_config, ... }
   */
  async processJob(job) {
    console.log(`\n🖨️ [JOB ${job.job_number}] Processando job ${job.id}...`);

    const startTime = Date.now();

    try {
      // Ajustar heartbeat para modo ATIVO (5s)
      this.heartbeatService.setHeartbeatInterval(true);

      // 1. Marcar como PROCESSING
      await fetch(
        `${this.config.BACKEND_URL}/api/erp/print-jobs-agent/${job.id}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Print-Agent-Key': this.config.PRINT_AGENT_API_KEY
          }
        }
      );

      console.log(`⏳ [JOB ${job.job_number}] Marcado como PROCESSING`);

      // 2. Processar conteúdo baseado no content_type
      let escposBuffer;

      if (job.content_type === 'ESCPOS') {
        // ESCPOS vem em Base64 (pois tem bytes binários que PostgreSQL não aceita)
        console.log(`📝 [JOB ${job.job_number}] Decodificando ESCPOS de Base64...`);
        escposBuffer = Buffer.from(job.content, 'base64');
        console.log(`✅ [JOB ${job.job_number}] Buffer ESCPOS: Base64 → ${escposBuffer.length} bytes`);
      } else {
        // TEXT ou outros: UTF-8 puro (sem conversão)
        console.log(`📝 [JOB ${job.job_number}] Enviando UTF-8 puro (sem conversão) para impressora chinesa...`);
        escposBuffer = Buffer.from(job.content, 'utf8');
        console.log(`✅ [JOB ${job.job_number}] Buffer UTF-8: ${job.content.length} chars → ${escposBuffer.length} bytes`);
      }

      // 3. Imprimir
      const printResult = await this.usbHandler.printToUSB(escposBuffer, job.printer_config);

      const duration = Date.now() - startTime;

      // 4. Marcar como COMPLETED
      await fetch(
        `${this.config.BACKEND_URL}/api/erp/print-jobs-agent/${job.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Print-Agent-Key': this.config.PRINT_AGENT_API_KEY
          },
          body: JSON.stringify({
            print_duration_ms: duration,
            agent_response: printResult
          })
        }
      );

      console.log(`✅ [JOB ${job.job_number}] Concluído com sucesso em ${duration}ms`);

      // Voltar heartbeat para modo IDLE (10s)
      this.heartbeatService.setHeartbeatInterval(false);

    } catch (error) {
      console.error(`❌ [JOB ${job.job_number}] Erro:`, error.message);

      // Voltar heartbeat para modo IDLE (10s)
      this.heartbeatService.setHeartbeatInterval(false);

      // Marcar como FAILED
      try {
        await fetch(
          `${this.config.BACKEND_URL}/api/erp/print-jobs-agent/${job.id}/fail`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Print-Agent-Key': this.config.PRINT_AGENT_API_KEY
            },
            body: JSON.stringify({
              error_message: error.message,
              error_code: error.code || 'UNKNOWN_ERROR'
            })
          }
        );
      } catch (failError) {
        console.error(`❌ [JOB ${job.job_number}] Erro ao marcar como FAILED:`, failError.message);
      }
    }
  }

  /**
   * Inicia o polling periódico de jobs
   *
   * @param {number} intervalMs - Intervalo de polling em milissegundos
   * @param {number} initialDelay - Delay inicial antes do primeiro poll (ms)
   */
  start(intervalMs, initialDelay = 2000) {
    console.log(`🔄 [POLLING] Iniciando polling (intervalo: ${intervalMs}ms)`);

    // Primeiro poll após delay inicial
    setTimeout(() => this.pollPendingJobs(), initialDelay);

    // Polls periódicos
    this.pollingInterval = setInterval(() => this.pollPendingJobs(), intervalMs);
  }

  /**
   * Para o polling
   */
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('🛑 [POLLING] Polling parado');
    }
  }
}

module.exports = JobPoller;
