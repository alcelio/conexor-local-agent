# 📦 Instaladores Conexor Local Agent v2.0.0

Instaladores nativos para todas as plataformas do **Conexor Local Agent**.

---

## 🪟 **Windows**

**Arquivo:** `ConexorLocalAgent-Setup-2.0.0.zip` (15 MB)

### **Instalação:**
1. Baixar e extrair o arquivo ZIP
2. Clicar com botão direito em `install.bat`
3. Selecionar **"Executar como Administrador"**
4. Aguardar a instalação concluir

### **O que o instalador faz:**
- ✅ Instala em `C:\Program Files\Conexor Local Agent`
- ✅ Configura Firewall do Windows automaticamente
- ✅ Cria atalho no Menu Iniciar
- ✅ Inicia o agente em segundo plano
- ✅ Autostart configurado automaticamente na primeira execução

### **Desinstalação:**
Execute `uninstall.bat` como Administrador (incluído no ZIP)

---

## 🍎 **macOS**

**Arquivo:** `ConexorLocalAgent-2.0.0.pkg` (19 MB)

### **Instalação:**
```bash
sudo installer -pkg ConexorLocalAgent-2.0.0.pkg -target /
```

Ou simplesmente dar duplo-clique no arquivo `.pkg` e seguir as instruções.

### **O que o instalador faz:**
- ✅ Instala em `/Applications/Conexor Local Agent/`
- ✅ Torna o binário executável
- ✅ Inicia o agente automaticamente em background
- ✅ Autostart configurado na primeira execução via LaunchAgent

### **Desinstalação:**
```bash
sudo rm -rf "/Applications/Conexor Local Agent"
rm ~/Library/LaunchAgents/com.conexor.local-agent.plist
pkill -f conexor-local-agent
```

---

## 🐧 **Linux**

### **Opção 1: Instalador Debian/Ubuntu (.deb)**
**Arquivo:** `conexor-local-agent_2.0.0_amd64.deb` (gerado em máquina Linux)

```bash
sudo dpkg -i conexor-local-agent_2.0.0_amd64.deb
```

**Nota:** O arquivo `.deb` precisa ser gerado em uma máquina Linux. Use o script `create-linux-installers.sh` em uma distro Debian/Ubuntu.

### **Opção 2: Instalador Portátil (qualquer distro)**
**Arquivo:** `conexor-local-agent-2.0.0-portable.tar.gz` (18 MB)

```bash
# Extrair
tar -xzf conexor-local-agent-2.0.0-portable.tar.gz

# Instalar globalmente (requer sudo)
sudo ./install.sh

# OU instalar apenas para usuário atual
./install.sh
```

### **O que o instalador faz:**
- ✅ Instala em `/usr/local/bin` (global) ou `~/.local/bin` (local)
- ✅ Cria entrada no menu de aplicativos
- ✅ Configura autostart (GNOME, KDE, XFCE)
- ✅ Adiciona ao PATH do sistema
- ✅ Inicia o agente em background

### **Desinstalação:**
```bash
sudo rm /usr/local/bin/conexor-local-agent
rm ~/.config/autostart/conexor-local-agent.desktop
pkill conexor-local-agent
```

---

## 🎯 **Após Instalação (Todas as Plataformas)**

1. O agente roda automaticamente em segundo plano (sem janela visível)
2. Acesse: **http://localhost:8080**
3. Configure sua **Chave de Conexão** via interface web
4. O agente iniciará automaticamente no próximo login

---

## ⚙️ **Comportamento do Autostart**

O Conexor Local Agent detecta automaticamente a primeira execução e instala o autostart:

### **Windows:**
- Cria atalho em `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
- Inicia automaticamente no login do usuário

### **macOS:**
- Cria LaunchAgent em `~/Library/LaunchAgents/com.conexor.local-agent.plist`
- Inicia automaticamente no login do usuário
- Logs em `~/Library/Logs/conexor-local-agent.log`

### **Linux:**
- Cria desktop entry em `~/.config/autostart/conexor-local-agent.desktop`
- Compatível com GNOME, KDE, XFCE
- Inicia com a sessão do usuário

---

## 📋 **Requisitos do Sistema**

| Plataforma | Requisitos |
|------------|-----------|
| **Windows** | Windows 10+ (x64), Permissões de Administrador |
| **macOS** | macOS 10.14+ (Intel/Apple Silicon) |
| **Linux** | Kernel 3.10+, x64 (Ubuntu, Debian, Fedora, Arch, etc.) |

---

## 🆘 **Suporte**

- 📧 Email: **suporte@conexor.com**
- 🐛 Issues: [GitHub Issues](https://github.com/alceliogomes/conexor-local-agent/issues)
- 📚 Docs: [docs.conexor.com](https://docs.conexor.com)

---

## 🔄 **Versionamento**

**Versão Atual:** `2.0.0`

O agente verifica automaticamente novas versões e atualiza silenciosamente em background.

---

**🚀 Pensado por Alcélio Gomes - Conexor - Software de Gestão Inteligente**
