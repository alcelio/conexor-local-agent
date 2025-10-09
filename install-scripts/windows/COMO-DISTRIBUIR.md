# 📦 Como Distribuir o Agente de Impressão para Clientes

## 🎯 O Que o Cliente Precisa

**Apenas 2 arquivos:**
1. `agent.exe` (executável compilado)
2. `instalador-simples.bat` (instalador automático)

**NÃO precisa enviar:**
- ❌ Pasta `node_modules`
- ❌ Código fonte
- ❌ Arquivos de desenvolvimento
- ❌ Nada além dos 2 arquivos acima

---

## 📋 Passos para Preparar Distribuição

### 1. Compilar o Agent

```bash
cd conexor-local-agent
npm run build:windows
```

Isso gera: `dist/agent-windows.exe`

### 2. Criar Pacote para Cliente

Crie uma pasta chamada `NeuroAgentes-Agente-Impressao` contendo:

```
NeuroAgentes-Agente-Impressao/
├── agent.exe                    ← (renomeie dist/agent-windows.exe)
└── instalador-simples.bat       ← (deste diretório)
```

### 3. Comprimir em ZIP

Comprima a pasta em: `NeuroAgentes-Agente-Impressao.zip`

---

## 👤 Instruções para o Cliente

### Instalação (1 clique)

1. **Extrair** o arquivo ZIP recebido
2. **Clicar com botão direito** em `instalador-simples.bat`
3. **Selecionar** "Executar como Administrador"
4. **Aguardar** a mensagem "INSTALAÇÃO CONCLUÍDA"
5. **Pronto!** O agente já está rodando e vai iniciar automaticamente sempre

### O Que Foi Instalado

✅ Agente copiado para: `C:\Program Files\NeuroAgentes\`
✅ Serviço Windows configurado (início automático)
✅ Atalho criado na Área de Trabalho: "Reiniciar Agente Impressao"

### Se Houver Problema com Impressão

1. Clicar no atalho **"Reiniciar Agente Impressao"** na área de trabalho
2. Executar **como Administrador**
3. Aguardar mensagem de sucesso

### Desinstalar

1. Executar `desinstalar.bat` **como Administrador**
2. Digitar `SIM` quando perguntado
3. Pronto!

---

## 🔧 Configuração (Opcional)

Se o cliente precisar configurar porta ou estação, crie um arquivo `config.json` ao lado do `agent.exe`:

```json
{
  "port": 3030,
  "stationId": "PDV-01",
  "apiUrl": "https://api.neuroagentes.com"
}
```

---

## 🚀 Automação Futura

**Próximos passos sugeridos:**

1. Criar instalador `.msi` profissional
2. Sistema de atualização automática
3. Painel de configuração visual
4. Monitoramento remoto via dashboard

---

## ❓ FAQ

**P: Cliente precisa instalar Node.js?**
R: ❌ NÃO! O `.exe` já tem tudo embutido.

**P: Funciona em Windows 7?**
R: ✅ Sim! Windows 7, 8, 10 e 11.

**P: E se o Windows atualizar?**
R: ✅ O serviço continua funcionando normalmente.

**P: Como saber se está rodando?**
R: Abrir "Serviços" do Windows e procurar "NeuroAgentes - Agente de Impressão"

**P: Precisa de internet?**
R: ✅ Sim, para conectar com a API da NeuroAgentes.

---

## 📞 Suporte

Em caso de problemas, verificar:
1. Firewall Windows está bloqueando?
2. Antivírus está bloqueando?
3. Impressora está conectada corretamente?
4. Agente está rodando? (verificar em Serviços)
