# 🚀 Conexor Local Agent

**Agente local multiplataforma para integração com dispositivos periféricos**

## 📦 Sobre

O Conexor Local Agent é um software standalone que roda localmente no computador do usuário, permitindo que o sistema Conexor (web/cloud) se comunique com:

- 🖨️ Impressoras térmicas (USB)
- 💳 Terminais POS (futuro)
- 📟 Leitores de código de barras (futuro)
- 🔌 Outros dispositivos USB/Serial

## ✨ Características

- ✅ **Multiplataforma:** Windows, macOS, Linux
- ✅ **Auto-atualização:** Atualiza automaticamente via GitHub Releases
- ✅ **Zero configuração:** Detecta dispositivos USB automaticamente
- ✅ **Seguro:** Comunicação autenticada via API Keys
- ✅ **Leve:** ~50MB, baixo consumo de recursos

## 📥 Download

Baixe a versão para seu sistema operacional:

- 🪟 [Windows (x64)](https://github.com/alceliogomes/conexor-local-agent/releases/latest/download/conexor-local-agent-win-x64.exe)
- 🍎 [macOS (Intel/Apple Silicon)](https://github.com/alceliogomes/conexor-local-agent/releases/latest/download/conexor-local-agent-macos-x64)
- 🐧 [Linux (x64)](https://github.com/alceliogomes/conexor-local-agent/releases/latest/download/conexor-local-agent-linux-x64)

## 🔧 Instalação

### Windows
1. Baixe o `.exe`
2. Execute com permissões de administrador
3. Configure via interface web em `http://localhost:8080`

### macOS
```bash
chmod +x conexor-local-agent-macos-x64
./conexor-local-agent-macos-x64
```

### Linux
```bash
chmod +x conexor-local-agent-linux-x64
./conexor-local-agent-linux-x64
```

## ⚙️ Configuração

O agente é configurado automaticamente via interface do Conexor. Você receberá uma **Chave de Conexão** ao criar um ponto de venda (caixa).

## 🏗️ Arquitetura

```
┌─────────────────────────────────┐
│   CONEXOR (Cloud/Web)           │
│   https://app.conexor.com       │
└────────────┬────────────────────┘
             │ HTTPS + API Key
             ↓
┌─────────────────────────────────┐
│   Conexor Local Agent           │
│   http://localhost:8080         │
└────────────┬────────────────────┘
             │ USB/Serial
             ↓
┌─────────────────────────────────┐
│   Dispositivos Locais           │
│   • Impressora térmica          │
│   • Terminal POS                │
│   • Leitor código barras        │
└─────────────────────────────────┘
```

## 🔄 Auto-Update

O agente verifica automaticamente novas versões:
- ✅ No startup (delay 5s)
- ✅ Diariamente às 03:00 AM
- ✅ Download e instalação silenciosa
- ✅ Validação SHA-256
- ✅ Rollback automático em caso de falha

## 🚀 Inicialização Automática

O Conexor Local Agent pode iniciar automaticamente com o sistema:

### **Via Interface Web (Recomendado)**

Após configurar o agente, você verá a opção "Iniciar com o Sistema" na interface web (`http://localhost:8080`).

### **Manualmente via API**

```bash
# Verificar status
curl http://localhost:8080/api/autostart/status

# Habilitar
curl -X POST http://localhost:8080/api/autostart/enable

# Desabilitar
curl -X POST http://localhost:8080/api/autostart/disable
```

### **Como Funciona por Plataforma**

**🪟 Windows:**
- Cria atalho em `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
- Inicia automaticamente no login do usuário
- Não requer permissões de administrador

**🍎 macOS:**
- Cria LaunchAgent em `~/Library/LaunchAgents/com.conexor.local-agent.plist`
- Inicia automaticamente no login do usuário
- Logs disponíveis em `~/Library/Logs/conexor-local-agent.log`

**🐧 Linux:**
- Cria desktop entry em `~/.config/autostart/conexor-local-agent.desktop`
- Compatível com GNOME, KDE, XFCE
- Inicia com a sessão do usuário

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Compilar binários
npm run build-all

# Compilar para plataforma específica
npm run build-win
npm run build-mac
npm run build-linux

# Criar instaladores (requer ícones em assets/)
npm run build-installers

# Criar instalador específico
npm run package-win   # Windows (NSIS .exe)
npm run package-mac   # macOS (.pkg)
npm run package-linux # Linux (.deb, .rpm, .AppImage)
```

### **📦 Build de Instaladores**

**Pré-requisitos:**
1. Ter os binários compilados em `dist/`
2. Ter ícones em `assets/` (icon.ico, icon.icns, icon.png)

**Comandos:**
```bash
# 1. Compilar binários
npm run build-all

# 2. Criar instaladores
npm run build-installers

# Instaladores ficam em: installers/
# - ConexorLocalAgent-Setup-2.0.0.exe (Windows)
# - ConexorLocalAgent-Setup-2.0.0.pkg (macOS)
# - conexor-local-agent-2.0.0.deb (Linux Debian/Ubuntu)
# - conexor-local-agent-2.0.0.rpm (Linux RedHat/Fedora)
# - conexor-local-agent-2.0.0.AppImage (Linux universal)
```

### **🎯 Comportamento do Instalador**

**Windows:**
- Instalação com um clique
- Configura Firewall automaticamente
- Inicia agente em background
- Adiciona no Menu Iniciar

**macOS:**
- Instalação via .pkg
- Copia para /Applications
- Inicia agente automaticamente
- Pede permissões necessárias

**Linux:**
- Instalação via apt/yum/AppImage
- Adiciona ao menu de aplicativos
- Configura autostart automaticamente

## 📄 Licença

MIT License - © 2025 Alcélio Gomes - Conexor

## 🤝 Suporte

- 📧 Email: suporte@conexor.com
- 🐛 Issues: [GitHub Issues](https://github.com/alceliogomes/conexor-local-agent/issues)
- 📚 Docs: [Documentação Conexor](https://docs.conexor.com)

---

**Pensado por:** Alcélio Gomes
**🚀 Conexor - Software de Gestão Inteligente**
