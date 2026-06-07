// print-agent-local/src/usb/USBPrinterHandler.js
/**
 * Pensado por: Alcélio Gomes
 * Codificado com Claude Code
 * 🧠 NeuroAgentes Platform - Intelligent Agent Development
 *
 * MÓDULO: Handler de Impressoras USB
 * Responsável por detectar, conectar e enviar dados para impressoras térmicas via USB
 */

class USBPrinterHandler {
  /**
   * @param {Object} usb - Módulo USB (node-usb)
   * @param {Object} config - Configuração do Print Agent
   */
  constructor(usb, config) {
    this.usb = usb;
    this.config = config;
  }

  /**
   * Envia buffer ESC/POS para impressora USB
   *
   * @param {Buffer} escposBuffer - Dados ESC/POS a serem enviados
   * @param {Object} printerConfig - Configuração da impressora (opcional, usa CONFIG.PRINTER por padrão)
   * @returns {Promise<Object>} Resultado da impressão { success, message, duration, bytesSent }
   */
  async printToUSB(escposBuffer, printerConfig = this.config.PRINTER) {
    return new Promise((resolve, reject) => {
      if (!this.usb) {
        return reject(new Error('Módulo USB não disponível'));
      }

      const startTime = Date.now();

      try {
        // VID/PID podem vir como hex string ("04b8") ou inteiro decimal (1208)
        // usb.findByIds() exige inteiros decimais
        const parseVidPid = (value, fallback) => {
          if (typeof value === 'number') return value;
          if (typeof value === 'string' && value.trim() !== '') return parseInt(value, 16);
          return fallback;
        };

        const vendorId  = parseVidPid(printerConfig.vendorId,  this.config.PRINTER.vendorId);
        const productId = parseVidPid(printerConfig.productId, this.config.PRINTER.productId);

        // Buscar impressora
        const device = this.usb.findByIds(vendorId, productId);

        if (!device) {
          return reject(new Error(`Impressora não encontrada (${vendorId.toString(16)}:${productId.toString(16)})`));
        }

        console.log(`🔍 [USB] Impressora encontrada: ${device.deviceDescriptor.idVendor}:${device.deviceDescriptor.idProduct}`);

        // Abrir device - Windows precisa de tratamento especial
        try {
          device.open();
        } catch (openError) {
          if (process.platform === 'win32' && openError.message.includes('LIBUSB_ERROR_NOT_SUPPORTED')) {
            console.warn('⚠️ [USB] Erro ao abrir device no Windows. Tentando com setConfiguration...');
            try {
              device.open();
              device.setConfiguration(1); // Força configuração padrão no Windows
            } catch (retryError) {
              return reject(new Error('Impressora USB nao suportada no Windows. Instale o driver WinUSB: https://zadig.akeo.ie/'));
            }
          } else {
            throw openError;
          }
        }

        // Buscar interface
        const iface = device.interface(printerConfig.interface || this.config.PRINTER.interface);

        // detachKernelDriver() só funciona no Linux, Windows não precisa
        if (process.platform !== 'win32' && iface.isKernelDriverActive()) {
          try {
            iface.detachKernelDriver();
          } catch (err) {
            console.warn('⚠️ [USB] Não foi possível desanexar driver do kernel:', err.message);
          }
        }

        iface.claim();

        // Buscar endpoint OUT
        const outEndpoint = iface.endpoints.find(
          ep => ep.direction === 'out'
        );

        if (!outEndpoint) {
          device.close();
          return reject(new Error('Endpoint OUT não encontrado'));
        }

        console.log(`📤 [USB] Enviando ${escposBuffer.length} bytes para impressora...`);

        // Enviar dados
        outEndpoint.transfer(escposBuffer, (error) => {
          const duration = Date.now() - startTime;

          // Limpar recursos
          try {
            iface.release(() => {
              device.close();
            });
          } catch (cleanupError) {
            console.warn('⚠️ [USB] Erro ao limpar recursos:', cleanupError.message);
          }

          if (error) {
            console.error(`❌ [USB] Erro na transferência: ${error.message}`);
            return reject(error);
          }

          console.log(`✅ [USB] Impressão concluída em ${duration}ms`);
          resolve({
            success: true,
            message: 'Impressão realizada com sucesso',
            duration,
            bytesSent: escposBuffer.length
          });
        });
      } catch (error) {
        console.error('❌ [USB] Erro ao configurar impressora:', error);
        reject(error);
      }
    });
  }

  /**
   * Verifica status atual da impressora USB
   *
   * @returns {Promise<Object>} Status { connected, status, name?, error? }
   */
  async checkPrinterStatus() {
    try {
      if (!this.config.PRINTER || !this.usb) {
        return { connected: false, status: 'NOT_CONFIGURED' };
      }

      const device = this.usb.findByIds(this.config.PRINTER.vendorId, this.config.PRINTER.productId);

      if (!device) {
        return { connected: false, status: 'OFFLINE' };
      }

      return {
        connected: true,
        status: 'READY',
        name: null // TODO: Implement getStringDescriptor if needed
      };
    } catch (error) {
      return {
        connected: false,
        status: 'ERROR',
        error: error.message
      };
    }
  }
}

module.exports = USBPrinterHandler;
