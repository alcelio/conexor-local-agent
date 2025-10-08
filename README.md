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
```

## 📄 Licença

MIT License - © 2025 Alcélio Gomes - Conexor

## 🤝 Suporte

- 📧 Email: suporte@conexor.com
- 🐛 Issues: [GitHub Issues](https://github.com/alceliogomes/conexor-local-agent/issues)
- 📚 Docs: [Documentação Conexor](https://docs.conexor.com)

---

**Pensado por:** Alcélio Gomes
**🚀 Conexor - Software de Gestão Inteligente**
