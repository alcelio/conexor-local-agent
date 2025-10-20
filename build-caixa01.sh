#!/bin/bash
# build-caixa01.sh
# Script para gerar executável com configuração hardcoded para caixa_01_602180

echo "🚀 =========================================="
echo "🚀 BUILD EXECUTÁVEL - CAIXA 01 (602180)"
echo "🚀 =========================================="
echo ""

# 1. Copiar config específico como config padrão
echo "📋 [1/4] Copiando configuração específica..."
cp config.caixa_01_602180.json config.json
echo "✅ Config caixa_01_602180 copiado para config.json"
echo ""

# 2. Compilar executável Windows
echo "🔨 [2/4] Compilando executável Windows..."
pkg agent.js --targets node18-win-x64 --out-path dist
echo "✅ Executável Windows gerado"
echo ""

# 3. Copiar config junto ao executável
echo "📦 [3/4] Copiando config junto ao executável..."
cp config.json dist/config.json
echo "✅ config.json copiado para dist/"
echo ""

# 4. Criar pacote ZIP com executável + config
echo "📦 [4/4] Criando pacote distribuível..."
cd dist

# Renomear executável para nome mais amigável
mv agent.exe NeuroAgentes-PrintAgent-Caixa01.exe 2>/dev/null || true

# Criar ZIP
zip -r NeuroAgentes-Agente-Impressao-Caixa01.zip NeuroAgentes-PrintAgent-Caixa01.exe config.json
cd ..
echo "✅ Pacote criado: dist/NeuroAgentes-Agente-Impressao-Caixa01.zip"
echo ""

echo "✅ =========================================="
echo "✅ BUILD CONCLUÍDO COM SUCESSO!"
echo "✅ =========================================="
echo ""
echo "📦 Arquivo gerado:"
echo "   → dist/NeuroAgentes-Agente-Impressao-Caixa01.zip"
echo ""
echo "📋 Configuração hardcoded:"
echo "   → ESTACAO_ID: caixa_01_602180"
echo "   → BACKEND: https://backend-production-0b20.up.railway.app"
echo "   → IMPRESSORA: 26728:512 (Térmica 58mm)"
echo ""
echo "🎯 Para distribuir:"
echo "   1. Envie o ZIP para o cliente"
echo "   2. Cliente descompacta"
echo "   3. Clica 2x em NeuroAgentes-PrintAgent-Caixa01.exe"
echo "   4. PRONTO! Já inicia com tudo configurado"
echo ""
