#!/usr/bin/env node
// conexor-local-agent/agent.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🚀 Conexor - Software de Gestão Inteligente
 *
 * CONEXOR LOCAL AGENT
 * Servidor HTTP + Polling automático de jobs PENDING do backend
 * Arquitetura modularizada para fácil manutenção e testes
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importar módulos
const ConfigManager = require('./src/config/ConfigManager');
const USBPrinterHandler = require('./src/usb/USBPrinterHandler');
const HeartbeatService = require('./src/heartbeat/HeartbeatService');
const JobPoller = require('./src/polling/JobPoller');
const UpdateService = require('./src/update/UpdateService');
const AutostartManager = require('./src/services/AutostartManager');
const setupRoutes = require('./src/api/routes');

// ========================================
// CONFIGURAR AUTOSTART AUTOMÁTICO
// ========================================
(async () => {
  try {
    const autostartManager = new AutostartManager();

    // Verificar se é primeira execução (autostart não habilitado)
    if (!autostartManager.isEnabled()) {
      console.log('🚀 [AUTOSTART] Primeira execução detectada');
      console.log('📝 [AUTOSTART] Instalando autostart automaticamente...');

      const result = await autostartManager.enable();

      if (result.success) {
        console.log('✅ [AUTOSTART] Autostart instalado com sucesso!');
        console.log(`   → ${autostartManager.getPlatformName()}: Agente iniciará automaticamente no login`);
      }
    } else {
      console.log('✅ [AUTOSTART] Autostart já está habilitado');
    }
  } catch (error) {
    console.warn('⚠️ [AUTOSTART] Não foi possível configurar autostart:', error.message);
    console.warn('   → Você pode habilitar manualmente via: http://localhost:8080/api/autostart/enable');
  }
})();

// ========================================
// CONFIGURAR EXECUÇÃO EM BACKGROUND (SEM CONSOLE)
// ========================================
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Em produção: Redirecionar logs para arquivo
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, 'conexor-agent.log');
  const errorLogFile = path.join(logsDir, 'conexor-agent-error.log');

  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  const errorStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

  // Sobrescrever console para logar em arquivo
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${args.join(' ')}\n`);
    originalLog.apply(console, args); // Manter log original também
  };

  console.error = (...args) => {
    const timestamp = new Date().toISOString();
    errorStream.write(`[${timestamp}] ERROR: ${args.join(' ')}\n`);
    originalError.apply(console, args);
  };

  console.log('📝 [LOGS] Logs sendo salvos em:', logFile);
}

// ========================================
// INICIALIZAÇÃO USB
// ========================================
let usb;
try {
  usb = require('usb');
  console.log('✅ [USB] Módulo USB carregado com sucesso');
} catch (error) {
  console.log('⚠️ [USB] Módulo USB não disponível (modo desenvolvimento)');
  usb = null;
}

// ========================================
// CARREGAR CONFIGURAÇÕES
// ========================================
const savedConfig = ConfigManager.loadConfig();

const CONFIG = {
  // Porta do servidor HTTP
  PORT: process.env.PORT || savedConfig?.PORT || 8080,

  // URL do backend (adapta automaticamente: Railway injeta isso ou usa localhost)
  BACKEND_URL: process.env.BACKEND_URL || savedConfig?.BACKEND_URL || 'http://localhost:3000',

  // ID da estação (deve corresponder ao estacao_id do banco)
  ESTACAO_ID: process.env.ESTACAO_ID || savedConfig?.ESTACAO_ID || 'CAIXA-01',

  // API Key para autenticação (OBRIGATÓRIO - usar key gerada no admin)
  PRINT_AGENT_API_KEY: process.env.PRINT_AGENT_API_KEY || savedConfig?.PRINT_AGENT_API_KEY || 'pka_test_dev_insecure_12345678',

  // Intervalo de polling (Railway pode ajustar)
  POLLING_INTERVAL: parseInt(process.env.POLLING_INTERVAL || savedConfig?.POLLING_INTERVAL || '5000', 10),

  // Timeout HTTP
  HTTP_TIMEOUT: parseInt(process.env.HTTP_TIMEOUT || savedConfig?.HTTP_TIMEOUT || '10000', 10),

  // Configuração da impressora USB - PRIORIDADE: savedConfig > env > defaults
  PRINTER: savedConfig?.PRINTER || {
    vendorId: parseInt(process.env.PRINTER_VENDOR_ID || '0x28e9', 16),
    productId: parseInt(process.env.PRINTER_PRODUCT_ID || '0x0289', 16),
    endpoint: parseInt(process.env.PRINTER_ENDPOINT || '0x02', 16),
    interface: parseInt(process.env.PRINTER_INTERFACE || '0', 10)
  }
};

console.log('🔧 [CONFIG] Configurações carregadas:');
console.log(`   - Backend: ${CONFIG.BACKEND_URL}`);
console.log(`   - Estação: ${CONFIG.ESTACAO_ID}`);
console.log(`   - Polling: ${CONFIG.POLLING_INTERVAL}ms`);
console.log(`   - Impressora: ${CONFIG.PRINTER?.vendorId ? `${CONFIG.PRINTER.vendorId}:${CONFIG.PRINTER.productId}` : 'não configurada'}`);

// ========================================
// INICIALIZAR SERVIÇOS
// ========================================
const usbHandler = new USBPrinterHandler(usb, CONFIG);
const heartbeatService = new HeartbeatService(CONFIG, usbHandler);
const jobPoller = new JobPoller(CONFIG, usbHandler, heartbeatService);
const updateService = new UpdateService(CONFIG);

// ========================================
// SERVIDOR EXPRESS
// ========================================
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Servir arquivos estáticos (interface web)
app.use(express.static(path.join(__dirname, 'public')));

// Registrar todas as rotas
setupRoutes(app, CONFIG, usb, usbHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================
app.listen(CONFIG.PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║  🖨️  PRINT AGENT COM POLLING - INICIADO               ║`);
  console.log(`╚════════════════════════════════════════════════════════╝`);
  console.log(`\n✅ Servidor HTTP rodando em http://localhost:${CONFIG.PORT}`);
  console.log(`✅ Estação: ${CONFIG.ESTACAO_ID}`);
  console.log(`✅ Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`✅ Polling: A cada ${CONFIG.POLLING_INTERVAL}ms`);
  console.log(`\n🔄 Iniciando serviços...\n`);

  // Iniciar polling de jobs
  jobPoller.start(CONFIG.POLLING_INTERVAL, 2000);

  // Iniciar heartbeat
  heartbeatService.start(3000);

  // Iniciar sistema de auto-atualização
  // - Verifica no startup (após 5s)
  // - Verifica 1x por dia (às 03:00 AM)
  updateService.schedulePeriodicCheck();
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('\n\n🛑 Encerrando Print Agent...');

  jobPoller.stop();
  heartbeatService.stop();
  updateService.stop();

  process.exit(0);
}
