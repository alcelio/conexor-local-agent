// /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/src/services/AutostartManager.js
/**
 * AutostartManager - Gerencia inicialização automática multiplataforma
 *
 * Pensado por: Alcélio Gomes
 * 🚀 Conexor - Software de Gestão Inteligente
 *
 * Funcionalidades:
 * - Windows: Atalho na pasta Startup
 * - macOS: LaunchAgent plist
 * - Linux: .desktop file em autostart
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class AutostartManager {
  constructor() {
    this.platform = os.platform();
    this.appName = 'Conexor Local Agent';
    this.executablePath = process.execPath;

    // Caminhos específicos por plataforma
    this.paths = this.getPlatformPaths();
  }

  /**
   * Retorna caminhos de autostart para cada plataforma
   */
  getPlatformPaths() {
    const homeDir = os.homedir();

    switch (this.platform) {
      case 'win32':
        return {
          startup: path.join(homeDir, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'),
          shortcut: path.join(homeDir, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Conexor Local Agent.lnk')
        };

      case 'darwin':
        return {
          launchAgents: path.join(homeDir, 'Library', 'LaunchAgents'),
          plist: path.join(homeDir, 'Library', 'LaunchAgents', 'com.conexor.local-agent.plist')
        };

      case 'linux':
        return {
          autostart: path.join(homeDir, '.config', 'autostart'),
          desktop: path.join(homeDir, '.config', 'autostart', 'conexor-local-agent.desktop')
        };

      default:
        throw new Error(`Plataforma não suportada: ${this.platform}`);
    }
  }

  /**
   * Verifica se autostart está habilitado
   */
  isEnabled() {
    try {
      switch (this.platform) {
        case 'win32':
          return fs.existsSync(this.paths.shortcut);

        case 'darwin':
          return fs.existsSync(this.paths.plist);

        case 'linux':
          return fs.existsSync(this.paths.desktop);

        default:
          return false;
      }
    } catch (error) {
      console.error('[AutostartManager] Erro ao verificar status:', error);
      return false;
    }
  }

  /**
   * Habilita autostart
   */
  async enable() {
    try {
      switch (this.platform) {
        case 'win32':
          return await this.enableWindows();

        case 'darwin':
          return await this.enableMacOS();

        case 'linux':
          return await this.enableLinux();

        default:
          throw new Error(`Plataforma não suportada: ${this.platform}`);
      }
    } catch (error) {
      console.error('[AutostartManager] Erro ao habilitar autostart:', error);
      throw error;
    }
  }

  /**
   * Desabilita autostart
   */
  async disable() {
    try {
      switch (this.platform) {
        case 'win32':
          if (fs.existsSync(this.paths.shortcut)) {
            fs.unlinkSync(this.paths.shortcut);
          }
          break;

        case 'darwin':
          if (fs.existsSync(this.paths.plist)) {
            // Descarregar LaunchAgent
            try {
              execSync(`launchctl unload "${this.paths.plist}"`);
            } catch (err) {
              // Ignorar erro se já estiver descarregado
            }
            fs.unlinkSync(this.paths.plist);
          }
          break;

        case 'linux':
          if (fs.existsSync(this.paths.desktop)) {
            fs.unlinkSync(this.paths.desktop);
          }
          break;

        default:
          throw new Error(`Plataforma não suportada: ${this.platform}`);
      }

      console.log('[AutostartManager] ✅ Autostart desabilitado');
      return { success: true, message: 'Autostart desabilitado com sucesso' };
    } catch (error) {
      console.error('[AutostartManager] Erro ao desabilitar autostart:', error);
      throw error;
    }
  }

  /**
   * Habilita autostart no Windows (atalho na pasta Startup)
   */
  async enableWindows() {
    // Garantir que pasta Startup existe
    if (!fs.existsSync(this.paths.startup)) {
      fs.mkdirSync(this.paths.startup, { recursive: true });
    }

    // Criar script VBS para criar atalho (workaround sem dependências)
    const vbsScript = `
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "${this.paths.shortcut.replace(/\\/g, '\\\\')}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "${this.executablePath.replace(/\\/g, '\\\\')}"
oLink.WorkingDirectory = "${path.dirname(this.executablePath).replace(/\\/g, '\\\\')}"
oLink.Description = "Conexor Local Agent - Agente de integração local"
oLink.IconLocation = "${this.executablePath.replace(/\\/g, '\\\\')},0"
oLink.Save
    `.trim();

    const vbsPath = path.join(os.tmpdir(), 'create-shortcut.vbs');
    fs.writeFileSync(vbsPath, vbsScript);

    try {
      execSync(`cscript //nologo "${vbsPath}"`, { windowsHide: true });
      fs.unlinkSync(vbsPath);
      console.log('[AutostartManager] ✅ Atalho criado no Startup do Windows');
      return { success: true, message: 'Autostart habilitado no Windows' };
    } catch (error) {
      fs.unlinkSync(vbsPath);
      throw error;
    }
  }

  /**
   * Habilita autostart no macOS (LaunchAgent)
   */
  async enableMacOS() {
    // Garantir que pasta LaunchAgents existe
    if (!fs.existsSync(this.paths.launchAgents)) {
      fs.mkdirSync(this.paths.launchAgents, { recursive: true });
    }

    // Criar arquivo plist
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.conexor.local-agent</string>

    <key>ProgramArguments</key>
    <array>
        <string>${this.executablePath}</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <false/>

    <key>StandardOutPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', 'conexor-local-agent.log')}</string>

    <key>StandardErrorPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', 'conexor-local-agent-error.log')}</string>

    <key>WorkingDirectory</key>
    <string>${path.dirname(this.executablePath)}</string>
</dict>
</plist>`;

    fs.writeFileSync(this.paths.plist, plistContent, 'utf8');

    // Carregar LaunchAgent
    try {
      execSync(`launchctl load "${this.paths.plist}"`);
      console.log('[AutostartManager] ✅ LaunchAgent criado no macOS');
      return { success: true, message: 'Autostart habilitado no macOS' };
    } catch (error) {
      // Não falhar se já estiver carregado
      console.log('[AutostartManager] ⚠️ LaunchAgent pode já estar carregado');
      return { success: true, message: 'Autostart habilitado no macOS' };
    }
  }

  /**
   * Habilita autostart no Linux (.desktop file)
   */
  async enableLinux() {
    // Garantir que pasta autostart existe
    if (!fs.existsSync(this.paths.autostart)) {
      fs.mkdirSync(this.paths.autostart, { recursive: true });
    }

    // Criar arquivo .desktop
    const desktopContent = `[Desktop Entry]
Type=Application
Version=1.0
Name=Conexor Local Agent
Comment=Agente de integração local para Conexor
Exec=${this.executablePath}
Icon=printer
Terminal=false
Categories=Utility;System;
StartupNotify=false
X-GNOME-Autostart-enabled=true`;

    fs.writeFileSync(this.paths.desktop, desktopContent, 'utf8');

    // Tornar executável
    fs.chmodSync(this.paths.desktop, 0o755);

    console.log('[AutostartManager] ✅ Desktop entry criado no Linux');
    return { success: true, message: 'Autostart habilitado no Linux' };
  }

  /**
   * Retorna informações sobre o status do autostart
   */
  getStatus() {
    const enabled = this.isEnabled();

    return {
      enabled,
      platform: this.platform,
      platformName: this.getPlatformName(),
      location: this.getAutostartLocation(),
      executablePath: this.executablePath
    };
  }

  /**
   * Retorna nome amigável da plataforma
   */
  getPlatformName() {
    switch (this.platform) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return this.platform;
    }
  }

  /**
   * Retorna localização do arquivo de autostart
   */
  getAutostartLocation() {
    switch (this.platform) {
      case 'win32':
        return this.paths.shortcut;
      case 'darwin':
        return this.paths.plist;
      case 'linux':
        return this.paths.desktop;
      default:
        return null;
    }
  }
}

module.exports = AutostartManager;
