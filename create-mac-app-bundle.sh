#!/bin/bash
# /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/create-mac-app-bundle.sh
# Criar instalador macOS via DMG (sem PKG, sem problemas de permissão)
# Pensado por: Alcélio Gomes
# 🚀 Conexor - Software de Gestão Inteligente

set -e

echo "🚀 Criando instalador DMG para macOS..."

APP_NAME="Conexor Local Agent"
VERSION="2.0.1"

# Limpar
rm -rf build-dmg
mkdir -p build-dmg

# Criar estrutura do .app bundle
APP_BUNDLE="build-dmg/$APP_NAME.app"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

# Copiar binário
echo "📦 Copiando binário..."
cp dist/conexor-local-agent-macos-x64 "$APP_BUNDLE/Contents/MacOS/conexor-local-agent"
chmod +x "$APP_BUNDLE/Contents/MacOS/conexor-local-agent"

# Copiar ícone (se existir)
if [ -f "assets/icon.icns" ]; then
    cp assets/icon.icns "$APP_BUNDLE/Contents/Resources/"
fi

# Criar Info.plist
cat > "$APP_BUNDLE/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>conexor-local-agent</string>
    <key>CFBundleIdentifier</key>
    <string>com.conexor.local-agent</string>
    <key>CFBundleName</key>
    <string>Conexor Local Agent</string>
    <key>CFBundleVersion</key>
    <string>2.0.1</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0.1</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Criar script de instalação simples
cat > "build-dmg/Instalar.command" << 'INSTALL'
#!/bin/bash
# Script de instalação

clear
echo "======================================"
echo "  INSTALADOR CONEXOR LOCAL AGENT"
echo "======================================"
echo ""
echo "Este script vai:"
echo "1. Copiar o app para /Applications"
echo "2. Configurar autostart"
echo "3. Iniciar o agente"
echo ""
read -p "Pressione ENTER para continuar..."

# Obter o diretório onde o script está
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_SOURCE="$SCRIPT_DIR/Conexor Local Agent.app"
APP_DEST="/Applications/Conexor Local Agent.app"

echo ""
echo "[1/4] Copiando para /Applications..."
if [ -d "$APP_DEST" ]; then
    echo "  Removendo versão antiga..."
    rm -rf "$APP_DEST"
fi

cp -R "$APP_SOURCE" "$APP_DEST"
chmod +x "$APP_DEST/Contents/MacOS/conexor-local-agent"

echo "[2/4] Configurando autostart..."
LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENT_DIR"

cat > "$LAUNCH_AGENT_DIR/com.conexor.local-agent.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.conexor.local-agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/Conexor Local Agent.app/Contents/MacOS/conexor-local-agent</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/conexor-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/conexor-agent.error.log</string>
</dict>
</plist>
PLIST

echo "[3/4] Carregando LaunchAgent..."
launchctl unload "$LAUNCH_AGENT_DIR/com.conexor.local-agent.plist" 2>/dev/null || true
launchctl load "$LAUNCH_AGENT_DIR/com.conexor.local-agent.plist"

echo "[4/4] Iniciando Conexor Local Agent..."
sleep 2

echo ""
echo "======================================"
echo "  INSTALAÇÃO CONCLUÍDA!"
echo "======================================"
echo ""
echo "✅ Conexor Local Agent instalado em:"
echo "   /Applications/Conexor Local Agent.app"
echo ""
echo "✅ O agente está rodando em segundo plano"
echo "✅ Acesse: http://localhost:8080"
echo ""
echo "Pressione ENTER para fechar..."
read
INSTALL

chmod +x "build-dmg/Instalar.command"

# Criar README
cat > "build-dmg/LEIA-ME.txt" << 'README'
====================================
 CONEXOR LOCAL AGENT v2.0.1
====================================

INSTALAÇÃO:

1. Duplo-clique em "Instalar.command"
2. Siga as instruções na tela
3. Aguarde a instalação concluir

APÓS INSTALAÇÃO:

- Acesse: http://localhost:8080
- Configure a Chave de Conexão
- Detecte sua impressora térmica

DESINSTALAÇÃO:

1. Fechar o agente: launchctl unload ~/Library/LaunchAgents/com.conexor.local-agent.plist
2. Remover app: rm -rf "/Applications/Conexor Local Agent.app"
3. Remover autostart: rm ~/Library/LaunchAgents/com.conexor.local-agent.plist

====================================
🚀 Conexor - Software de Gestão Inteligente
Pensado por: Alcélio Gomes
====================================
README

echo ""
echo "✅ Estrutura criada!"
echo "📂 Conteúdo em: build-dmg/"
echo ""
echo "🎯 Para testar localmente:"
echo "   cd build-dmg"
echo "   ./Instalar.command"
echo ""
echo "📦 Para criar DMG:"
echo "   hdiutil create -volname 'Conexor Local Agent' -srcfolder build-dmg -ov -format UDZO installers/ConexorLocalAgent-${VERSION}.dmg"
echo ""
