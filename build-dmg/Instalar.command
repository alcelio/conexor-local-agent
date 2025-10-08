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
