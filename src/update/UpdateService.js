// print-agent-local/src/update/UpdateService.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

/**
 * UpdateService - Gerencia auto-atualização do Print Agent
 *
 * Responsabilidades:
 * - Verificar versão disponível no backend
 * - Baixar nova versão do GitHub Releases
 * - Validar checksum SHA-256
 * - Substituir binário atual
 * - Reiniciar serviço
 * - Rollback automático em caso de falha
 */
class UpdateService {
  constructor(config) {
    this.config = config;
    this.currentVersion = require('../../package.json').version;
    this.isUpdating = false;
    this.dailyCheckInterval = null;
  }

  /**
   * Verifica se existe versão mais nova disponível
   * @returns {Promise<{available: boolean, info?: object, error?: Error}>}
   */
  async checkForUpdates() {
    try {
      console.log(`\n📦 [UPDATE] Verificando atualizações...`);
      console.log(`📦 [UPDATE] Versão atual: ${this.currentVersion}`);

      const response = await fetch(
        `${this.config.BACKEND_URL}/api/erp/print-agent/latest-version`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Backend retornou ${response.status}`);
      }

      const data = await response.json();

      console.log(`📦 [UPDATE] Versão disponível: ${data.version}`);

      if (this.isNewerVersion(data.version, this.currentVersion)) {
        console.log(`🆕 [UPDATE] Nova versão disponível!`);
        console.log(`📝 [UPDATE] Changelog:`);
        data.changelog?.forEach(change => console.log(`   - ${change}`));

        return { available: true, info: data };
      }

      console.log(`✅ [UPDATE] Versão atualizada\n`);
      return { available: false };

    } catch (error) {
      console.error(`❌ [UPDATE] Erro ao verificar atualizações:`, error.message);
      return { available: false, error };
    }
  }

  /**
   * Baixa e instala nova versão do Print Agent
   * @param {object} updateInfo - Informações da atualização
   */
  async downloadAndInstall(updateInfo) {
    if (this.isUpdating) {
      console.log('⚠️ [UPDATE] Atualização já em andamento');
      return;
    }

    this.isUpdating = true;

    try {
      const platform = this.getPlatform();
      const downloadUrl = updateInfo.downloads[platform];
      const expectedChecksum = updateInfo.checksums[platform]?.replace('sha256:', '');

      console.log(`\n📥 [UPDATE] Baixando versão ${updateInfo.version} (${platform})...`);
      console.log(`📥 [UPDATE] URL: ${downloadUrl}`);

      // 1. Download binary
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Download falhou: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`✅ [UPDATE] Download concluído (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

      // 2. Verify checksum (se disponível)
      if (expectedChecksum) {
        console.log(`🔐 [UPDATE] Validando checksum...`);
        const actualChecksum = crypto.createHash('sha256').update(buffer).digest('hex');

        if (actualChecksum !== expectedChecksum) {
          throw new Error(`Checksum inválido!\n   Esperado: ${expectedChecksum}\n   Recebido: ${actualChecksum}`);
        }

        console.log(`✅ [UPDATE] Checksum validado`);
      } else {
        console.log(`⚠️ [UPDATE] Checksum não disponível - pulando validação`);
      }

      // 3. Replace binary
      await this.replaceBinary(buffer, updateInfo.version);

      console.log(`✅ [UPDATE] Atualização instalada com sucesso!`);
      console.log(`🔄 [UPDATE] Reiniciando Print Agent em 3 segundos...\n`);

      // 4. Restart (delay para logs aparecerem)
      setTimeout(() => {
        process.exit(0); // Windows Service relança automaticamente
      }, 3000);

    } catch (error) {
      console.error(`❌ [UPDATE] Falha na atualização:`, error.message);
      this.isUpdating = false;

      // Rollback se arquivo foi modificado
      this.rollback();
    }
  }

  /**
   * Substitui binário atual pelo novo
   * @param {Buffer} newBinary - Conteúdo do novo executável
   * @param {string} version - Versão sendo instalada
   */
  async replaceBinary(newBinary, version) {
    const currentExe = process.execPath;
    const backupExe = currentExe + '.old';
    const newExe = currentExe + '.new';

    console.log(`🔄 [UPDATE] Substituindo binário...`);
    console.log(`   Atual: ${currentExe}`);

    // Write new binary to temp location
    fs.writeFileSync(newExe, newBinary);
    console.log(`   ✅ Novo binário salvo: ${newExe}`);

    // Backup current binary
    if (fs.existsSync(currentExe)) {
      if (fs.existsSync(backupExe)) {
        fs.unlinkSync(backupExe); // Remove backup antigo
      }
      fs.renameSync(currentExe, backupExe);
      console.log(`   ✅ Backup criado: ${backupExe}`);
    }

    // Install new binary
    fs.renameSync(newExe, currentExe);

    // Make executable (Unix systems)
    if (process.platform !== 'win32') {
      fs.chmodSync(currentExe, 0o755);
    }

    console.log(`   ✅ Novo binário instalado: ${currentExe}`);
  }

  /**
   * Rollback para versão anterior em caso de falha
   */
  rollback() {
    const currentExe = process.execPath;
    const backupExe = currentExe + '.old';

    if (fs.existsSync(backupExe)) {
      console.log(`\n🔄 [UPDATE] Fazendo rollback para versão anterior...`);

      try {
        if (fs.existsSync(currentExe)) {
          fs.unlinkSync(currentExe);
        }
        fs.renameSync(backupExe, currentExe);

        console.log(`✅ [UPDATE] Rollback concluído`);
        console.log(`🔄 [UPDATE] Reiniciando com versão anterior...\n`);

        setTimeout(() => process.exit(0), 2000);
      } catch (error) {
        console.error(`❌ [UPDATE] Falha no rollback:`, error.message);
      }
    } else {
      console.log(`⚠️ [UPDATE] Backup não encontrado - rollback impossível`);
    }
  }

  /**
   * Compara versões semver (major.minor.patch)
   * @param {string} remote - Versão remota
   * @param {string} local - Versão local
   * @returns {boolean} True se remote > local
   */
  isNewerVersion(remote, local) {
    const remoteParts = remote.split('.').map(Number);
    const localParts = local.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (remoteParts[i] > localParts[i]) return true;
      if (remoteParts[i] < localParts[i]) return false;
    }

    return false; // Versões idênticas
  }

  /**
   * Retorna identificador de plataforma
   * @returns {string} 'windows' | 'macos' | 'linux'
   */
  getPlatform() {
    switch (process.platform) {
      case 'win32': return 'windows';
      case 'darwin': return 'macos';
      case 'linux': return 'linux';
      default: return 'linux';
    }
  }

  /**
   * Agenda verificações periódicas de atualização
   * - Verifica no startup (após 5s)
   * - Verifica 1x por dia (às 03:00)
   */
  schedulePeriodicCheck() {
    // Check on startup (5s delay para não atrapalhar inicialização)
    setTimeout(() => {
      this.performUpdateCheck();
    }, 5000);

    // Daily check às 03:00 AM
    this.scheduleDailyCheck();
  }

  /**
   * Agenda verificação diária às 03:00
   */
  scheduleDailyCheck() {
    const now = new Date();
    const targetTime = new Date();

    // Próxima 03:00 AM
    targetTime.setHours(3, 0, 0, 0);

    // Se já passou das 03:00 hoje, agendar para amanhã
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const msUntilTarget = targetTime.getTime() - now.getTime();

    console.log(`⏰ [UPDATE] Próxima verificação diária: ${targetTime.toLocaleString('pt-BR')}`);

    setTimeout(() => {
      this.performUpdateCheck();

      // Reagendar para próximo dia
      this.scheduleDailyCheck();
    }, msUntilTarget);
  }

  /**
   * Executa verificação e instalação se disponível
   */
  async performUpdateCheck() {
    const result = await this.checkForUpdates();

    if (result.available && result.info) {
      try {
        await this.downloadAndInstall(result.info);
      } catch (error) {
        console.error(`❌ [UPDATE] Erro ao aplicar atualização:`, error);
      }
    }
  }

  /**
   * Para verificações agendadas (usado no graceful shutdown)
   */
  stop() {
    if (this.dailyCheckInterval) {
      clearTimeout(this.dailyCheckInterval);
      this.dailyCheckInterval = null;
    }
  }
}

module.exports = UpdateService;
