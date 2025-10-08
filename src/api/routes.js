// print-agent-local/src/api/routes.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * MÓDULO: Rotas Express API
 * Define todos os endpoints HTTP do Print Agent
 */

const { removeAccents, extractEstacaoIdFromApiKey } = require('../utils/textNormalizer');
const ConfigManager = require('../config/ConfigManager');
const AutostartManager = require('../services/AutostartManager');

/**
 * Registra todas as rotas no app Express
 *
 * @param {Express} app - Aplicação Express
 * @param {Object} config - Configuração do Print Agent (será modificada por referência)
 * @param {Object} usb - Módulo USB
 * @param {Object} usbHandler - Handler de impressora USB
 */
function setupRoutes(app, config, usb, usbHandler) {

  // ========================================
  // HEALTH CHECK
  // ========================================
  app.get('/health', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      estacao_id: config.ESTACAO_ID,
      usb_available: !!usb,
      backend_url: config.BACKEND_URL
    });
  });

  // ========================================
  // CONFIGURAÇÃO
  // ========================================

  // GET /api/config - Retornar configuração atual
  app.get('/api/config', (req, res) => {
    res.json({
      success: true,
      config: config
    });
  });

  // POST /api/config - Salvar nova configuração
  app.post('/api/config', async (req, res) => {
    try {
      const apiKey = req.body.PRINT_AGENT_API_KEY;

      console.log('🔍 [CONFIG] Dados recebidos do frontend:');
      console.log('   - PRINT_AGENT_API_KEY:', apiKey);
      console.log('   - BACKEND_URL:', req.body.BACKEND_URL);
      console.log('   - PRINTER:', req.body.PRINTER);

      // EXTRAIR AUTOMATICAMENTE O ESTACAO_ID DA API KEY
      const extractedEstacaoId = extractEstacaoIdFromApiKey(apiKey);
      console.log('🔑 [CONFIG] ESTACAO_ID extraído automaticamente:', extractedEstacaoId);

      const newConfig = {
        PORT: config.PORT, // Manter porta atual
        BACKEND_URL: req.body.BACKEND_URL || config.BACKEND_URL,
        ESTACAO_ID: extractedEstacaoId || config.ESTACAO_ID, // EXTRAÍDO AUTOMATICAMENTE!
        PRINT_AGENT_API_KEY: apiKey || config.PRINT_AGENT_API_KEY,
        POLLING_INTERVAL: config.POLLING_INTERVAL,
        HTTP_TIMEOUT: config.HTTP_TIMEOUT,
        PRINTER: req.body.PRINTER || config.PRINTER
      };

      console.log('💾 [CONFIG] Configuração que será salva:');
      console.log('   - ESTACAO_ID (extraído):', newConfig.ESTACAO_ID);
      console.log('   - PRINT_AGENT_API_KEY:', newConfig.PRINT_AGENT_API_KEY);

      if (ConfigManager.saveConfig(newConfig)) {
        // ATUALIZAR CONFIG EM MEMÓRIA (sem matar o processo!)
        Object.assign(config, newConfig);

        console.log('🔄 [CONFIG] Configuração atualizada em memória!');
        console.log('✅ [CONFIG] Nova Estação:', config.ESTACAO_ID);
        console.log('✅ [CONFIG] Nova Impressora:', config.PRINTER);

        // SINCRONIZAR configuração da impressora com o backend
        if (newConfig.PRINTER && newConfig.PRINTER.vendorId && newConfig.PRINTER.productId) {
          console.log('🔄 [CONFIG] Sincronizando configuração da impressora com backend...');
          try {
            await ConfigManager.syncPrinterConfigToBackend(newConfig);
            console.log('✅ [CONFIG] Configuração da impressora sincronizada com backend!');
          } catch (syncError) {
            console.error('⚠️ [CONFIG] Erro ao sincronizar com backend (continuando):', syncError.message);
            // Não falhar o POST mesmo se sync falhar - config local foi salva
          }
        }

        res.json({
          success: true,
          message: 'Configuração salva e aplicada com sucesso!',
          config: newConfig
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao salvar configuração'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // ========================================
  // DESCOBERTA DE IMPRESSORAS
  // ========================================

  // GET /api/printers - Detectar impressoras USB (formato simples)
  app.get('/api/printers', (req, res) => {
    try {
      if (!usb) {
        return res.json({
          success: false,
          message: 'Módulo USB não disponível',
          printers: []
        });
      }

      const devices = usb.getDeviceList();
      const printers = devices.map(device => {
        const desc = device.deviceDescriptor;
        return {
          vendorId: desc.idVendor,
          productId: desc.idProduct,
          interface: 0,
          endpoint: 2
        };
      });

      res.json({
        success: true,
        printers,
        message: `${printers.length} dispositivo(s) USB encontrado(s)`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        printers: []
      });
    }
  });

  // GET /api/printer/discover - Descobrir impressoras (formato completo para frontend)
  app.get('/api/printer/discover', (req, res) => {
    try {
      console.log('🔍 [DISCOVER] Buscando impressoras USB...');

      if (!usb) {
        return res.json({
          success: false,
          message: 'Módulo USB não disponível',
          printers: [],
          totalFound: 0,
          agentInfo: {
            name: 'NeuroAgentes Print Agent',
            version: '2.0',
            platform: process.platform,
            status: 'online'
          }
        });
      }

      const devices = usb.getDeviceList();
      const printers = devices
        .filter(device => {
          const desc = device.deviceDescriptor;
          // Filtrar apenas dispositivos de classe impressora (0x07) ou todos se não tiver classe definida
          return desc.bDeviceClass === 0x07 || desc.bDeviceClass === 0x00;
        })
        .map(device => {
          const desc = device.deviceDescriptor;
          const vendorId = desc.idVendor;
          const productId = desc.idProduct;

          // Detectar fabricantes conhecidos
          let manufacturer = 'Desconhecido';
          let model = `USB ${vendorId}:${productId}`;
          let recommended = false;

          if (vendorId === 0x0416) {
            manufacturer = 'SATO';
            model = 'Impressora Térmica SATO';
          } else if (vendorId === 0x04b8) {
            manufacturer = 'Epson';
            model = 'Impressora Térmica Epson';
            recommended = true;
          } else if (vendorId === 0x0483) {
            manufacturer = 'STMicroelectronics';
            model = 'Impressora Térmica Genérica';
          } else if (vendorId === 0x6868) {
            manufacturer = 'Generic';
            model = 'Impressora Térmica 58mm';
            recommended = true;
          }

          return {
            id: `${vendorId}_${productId}`,
            name: model,
            manufacturer: manufacturer,
            model: model,
            vendorId: vendorId,
            productId: productId,
            vendorIdHex: `0x${vendorId.toString(16).padStart(4, '0')}`,
            productIdHex: `0x${productId.toString(16).padStart(4, '0')}`,
            connectionString: `USB ${vendorId}:${productId}`,
            recommended: recommended,
            status: 'ready',
            type: 'thermal'
          };
        });

      console.log(`✅ [DISCOVER] ${printers.length} impressora(s) encontrada(s)`);

      res.json({
        success: true,
        message: `${printers.length} impressora(s) USB encontrada(s)`,
        printers: printers,
        totalFound: printers.length,
        agentInfo: {
          name: 'NeuroAgentes Print Agent',
          version: '2.0',
          platform: process.platform,
          status: 'online'
        },
        instructions: {
          setup: 'Conecte a impressora USB e aguarde o sistema detectá-la',
          testing: 'Clique em "Testar" para verificar se a impressora responde corretamente'
        }
      });
    } catch (error) {
      console.error('❌ [DISCOVER] Erro:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        printers: [],
        totalFound: 0,
        agentInfo: {
          name: 'NeuroAgentes Print Agent',
          version: '2.0',
          platform: process.platform,
          status: 'error'
        }
      });
    }
  });

  // ========================================
  // IMPRESSÃO
  // ========================================

  // POST /api/test-print - Testar impressão
  app.post('/api/test-print', async (req, res) => {
    try {
      console.log('🧪 [TEST] Executando teste de impressão...');

      // Criar conteúdo de teste ESC/POS (com normalização de acentos)
      const titulo = removeAccents('TESTE DE IMPRESSÃO');
      const estacao = removeAccents(`Estação: ${config.ESTACAO_ID}`);
      const horario = removeAccents(`Horário: ${new Date().toLocaleString('pt-BR')}`);
      const sucesso = removeAccents('Print Agent funcionando!');

      const testContent = Buffer.concat([
        Buffer.from([0x1B, 0x40]), // Inicializar impressora
        Buffer.from([0x1B, 0x61, 0x01]), // Centralizar
        Buffer.from([0x1D, 0x21, 0x11]), // Fonte maior
        Buffer.from(titulo + '\n', 'ascii'),
        Buffer.from([0x1D, 0x21, 0x00]), // Fonte normal
        Buffer.from([0x1B, 0x61, 0x00]), // Alinhar esquerda
        Buffer.from('\n'),
        Buffer.from(estacao + '\n', 'ascii'),
        Buffer.from(horario + '\n', 'ascii'),
        Buffer.from('\n'),
        Buffer.from(sucesso + '\n', 'ascii'),
        Buffer.from('\n\n\n'),
        Buffer.from([0x1D, 0x56, 0x00]) // Cortar papel
      ]);

      const result = await usbHandler.printToUSB(testContent);

      res.json({
        success: true,
        message: 'Teste de impressão enviado!',
        result
      });
    } catch (error) {
      console.error('❌ [TEST] Erro:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // POST /api/printer/print - Endpoint legado de impressão direta (mantido para compatibilidade)
  app.post('/api/printer/print', async (req, res) => {
    try {
      console.log('🖨️ [PRINT] Recebida requisição de impressão direta');

      const { content, printerConfig } = req.body;

      if (!content) {
        return res.status(400).json({ success: false, error: 'Conteúdo ESC/POS é obrigatório' });
      }

      // Converter string base64 ou hex para Buffer
      let escposBuffer;
      if (typeof content === 'string') {
        if (content.startsWith('0x')) {
          escposBuffer = Buffer.from(content.slice(2), 'hex');
        } else {
          escposBuffer = Buffer.from(content, 'base64');
        }
      } else {
        escposBuffer = Buffer.from(content);
      }

      // Enviar para impressora
      const result = await usbHandler.printToUSB(escposBuffer, printerConfig);

      res.json(result);
    } catch (error) {
      console.error('❌ [PRINT] Erro:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================
  // AUTOSTART - INICIALIZAÇÃO AUTOMÁTICA
  // ========================================

  const autostartManager = new AutostartManager();

  // GET /api/autostart/status - Verificar status do autostart
  app.get('/api/autostart/status', (req, res) => {
    try {
      console.log('🔍 [AUTOSTART] Verificando status...');
      const status = autostartManager.getStatus();

      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('❌ [AUTOSTART] Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // POST /api/autostart/enable - Habilitar autostart
  app.post('/api/autostart/enable', async (req, res) => {
    try {
      console.log('🚀 [AUTOSTART] Habilitando autostart...');
      const result = await autostartManager.enable();

      console.log('✅ [AUTOSTART] Autostart habilitado com sucesso!');
      res.json(result);
    } catch (error) {
      console.error('❌ [AUTOSTART] Erro ao habilitar:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // POST /api/autostart/disable - Desabilitar autostart
  app.post('/api/autostart/disable', async (req, res) => {
    try {
      console.log('🛑 [AUTOSTART] Desabilitando autostart...');
      const result = await autostartManager.disable();

      console.log('✅ [AUTOSTART] Autostart desabilitado com sucesso!');
      res.json(result);
    } catch (error) {
      console.error('❌ [AUTOSTART] Erro ao desabilitar:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

module.exports = setupRoutes;
