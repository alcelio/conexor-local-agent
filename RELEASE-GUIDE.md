# 🚀 GUIA DE RELEASE v2.0.1

## ✅ **PASSO 1: Fazer Upload no GitHub Release**

### **1.1 Acessar GitHub Releases:**
```
https://github.com/alcelio/conexor-local-agent/releases
```

### **1.2 Criar Nova Release:**
1. Clicar em **"Draft a new release"**
2. Selecionar tag: **v2.0.1** (já existe)
3. Title: **"Conexor Local Agent v2.0.1 - Instaladores Nativos"**

### **1.3 Descrição da Release (copiar e colar):**

```markdown
# 🚀 Conexor Local Agent v2.0.1

Primeira versão com **instaladores nativos** para todas as plataformas!

## ✨ Novidades

### 📦 **Instalação One-Click**
- 🪟 **Windows:** Apenas extrair e clicar em `install.bat` (como administrador)
- 🍎 **macOS:** Duplo-clique no `.pkg` e seguir instalador gráfico
- 🐧 **Linux:** Extrair e executar `./install.sh`

### 🎯 **Funcionalidades**
- ✅ **Autostart automático:** Inicia com o sistema na primeira execução
- ✅ **Execução headless:** Roda em segundo plano (sem janela visível)
- ✅ **Configuração web:** Interface em `http://localhost:8080`
- ✅ **Auto-update:** Atualiza automaticamente via GitHub Releases
- ✅ **Firewall:** Configurado automaticamente no Windows

---

## 📥 Downloads

| Plataforma | Arquivo | Tamanho |
|------------|---------|---------|
| 🪟 **Windows** | `ConexorLocalAgent-Setup-2.0.1.zip` | 15 MB |
| 🍎 **macOS** | `ConexorLocalAgent-2.0.1.pkg` | 19 MB |
| 🐧 **Linux** | `conexor-local-agent-2.0.1-portable.tar.gz` | 18 MB |

---

## 🔧 Instalação

### **Windows:**
1. Baixar `ConexorLocalAgent-Setup-2.0.1.zip`
2. Extrair o arquivo
3. Clicar com botão direito em `install.bat`
4. Selecionar **"Executar como Administrador"**
5. Aguardar instalação concluir

### **macOS:**
1. Baixar `ConexorLocalAgent-2.0.1.pkg`
2. Dar duplo-clique no arquivo
3. Seguir instruções do instalador
4. Permitir permissões quando solicitado

### **Linux:**
1. Baixar `conexor-local-agent-2.0.1-portable.tar.gz`
2. Extrair: `tar -xzf conexor-local-agent-2.0.1-portable.tar.gz`
3. Executar: `./install.sh` (ou `sudo ./install.sh` para instalação global)

---

## 📋 Requisitos

- **Windows:** Windows 10+ (x64)
- **macOS:** macOS 10.14+ (Intel/Apple Silicon)
- **Linux:** Kernel 3.10+ (x64)

---

## 🆘 Suporte

- 📧 **Email:** suporte@conexor.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/alcelio/conexor-local-agent/issues)
- 📚 **Docs:** [docs.conexor.com](https://docs.conexor.com)

---

**🧠 Pensado por Alcélio Gomes - Conexor**
**🚀 Software de Gestão Inteligente**
```

### **1.4 Fazer Upload dos Arquivos:**

Arrastar e soltar estes 3 arquivos na seção **"Attach binaries"**:

```
📂 installers/
├── ConexorLocalAgent-Setup-2.0.0.zip       → Renomear para 2.0.1
├── ConexorLocalAgent-2.0.0.pkg             → Renomear para 2.0.1
└── conexor-local-agent-2.0.0-portable.tar.gz → Renomear para 2.0.1
```

**IMPORTANTE:** Antes de fazer upload, renomear os arquivos:

```bash
cd installers/
mv ConexorLocalAgent-Setup-2.0.0.zip ConexorLocalAgent-Setup-2.0.1.zip
mv ConexorLocalAgent-2.0.0.pkg ConexorLocalAgent-2.0.1.pkg
mv conexor-local-agent-2.0.0-portable.tar.gz conexor-local-agent-2.0.1-portable.tar.gz
```

### **1.5 Publicar Release:**
Clicar em **"Publish release"**

---

## ✅ **PASSO 2: Atualizar Links no Conexor**

### **2.1 Localizar arquivo de downloads atual:**
Procurar onde está a página de downloads no frontend do Conexor.

Provavelmente:
```
frontend/src/pages/downloads/
frontend/src/components/downloads/
```

### **2.2 Novos URLs para usar:**

**Windows:**
```
https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/ConexorLocalAgent-Setup-2.0.1.zip
```

**macOS:**
```
https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/ConexorLocalAgent-2.0.1.pkg
```

**Linux:**
```
https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/conexor-local-agent-2.0.1-portable.tar.gz
```

### **2.3 Exemplo de código para botões:**

```typescript
// Exemplo de implementação
const AGENT_DOWNLOADS = {
  windows: {
    url: 'https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/ConexorLocalAgent-Setup-2.0.1.zip',
    size: '15 MB',
    label: 'Download para Windows'
  },
  macos: {
    url: 'https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/ConexorLocalAgent-2.0.1.pkg',
    size: '19 MB',
    label: 'Download para macOS'
  },
  linux: {
    url: 'https://github.com/alcelio/conexor-local-agent/releases/download/v2.0.1/conexor-local-agent-2.0.1-portable.tar.gz',
    size: '18 MB',
    label: 'Download para Linux'
  }
};

function DownloadButton({ platform }) {
  return (
    <a
      href={AGENT_DOWNLOADS[platform].url}
      download
      className="download-button"
    >
      {AGENT_DOWNLOADS[platform].label} ({AGENT_DOWNLOADS[platform].size})
    </a>
  );
}
```

---

## ✅ **PASSO 3: Testar Downloads**

Após publicar release e atualizar links:

1. ✅ Acessar página de downloads do Conexor
2. ✅ Clicar em cada botão de download
3. ✅ Verificar se arquivo baixa corretamente
4. ✅ Testar instalação em cada plataforma (se possível)

---

## 📝 **Checklist Final**

- [ ] Release v2.0.1 criada no GitHub
- [ ] 3 instaladores renomeados para v2.0.1
- [ ] Upload dos 3 instaladores no GitHub Release
- [ ] Descrição da release preenchida
- [ ] Release publicada (não mais draft)
- [ ] Links atualizados na página do Conexor
- [ ] Downloads testados

---

## 🎯 **Próximas Versões**

Quando criar v2.0.2, v2.1.0, etc:

1. Rodar scripts de build novamente
2. Renomear arquivos para nova versão
3. Criar nova tag: `git tag v2.X.X`
4. Push da tag: `git push origin v2.X.X`
5. Fazer upload no GitHub Release
6. Atualizar links no Conexor

**Auto-update cuida do resto!** 🚀

---

**🧠 Pensado por Alcélio Gomes - Conexor**
