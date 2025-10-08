#!/bin/bash
# /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/create-mac-installer.sh
# Script para criar instalador macOS (.pkg)
# Pensado por: Alcélio Gomes
# 🚀 Conexor - Software de Gestão Inteligente

set -e

echo "🚀 Criando instalador macOS para Conexor Local Agent..."

# Variáveis
APP_NAME="Conexor Local Agent"
VERSION="2.0.1"
IDENTIFIER="com.conexor.local-agent"

# Criar estrutura de diretórios (instalar no HOME do usuário)
rm -rf build-pkg
mkdir -p "build-pkg/Library/Conexor"
mkdir -p build-pkg/scripts

# Copiar binário
echo "📦 Copiando binário..."
cp dist/conexor-local-agent-macos-x64 "build-pkg/Library/Conexor/"
chmod +x "build-pkg/Library/Conexor/conexor-local-agent-macos-x64"

# Criar script postinstall que copia para Applications e inicia
cat > build-pkg/scripts/postinstall << 'SCRIPT'
#!/bin/bash
# Post-install script

# Criar pasta em Applications (sem sudo)
INSTALL_DIR="/Applications/Conexor Local Agent"
USER_HOME=$(eval echo ~$USER)

echo "Instalando Conexor Local Agent..."

# Copiar de /Library/Conexor para /Applications
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"
cp /Library/Conexor/conexor-local-agent-macos-x64 "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/conexor-local-agent-macos-x64"

# Criar LaunchAgent para autostart
LAUNCH_AGENT_DIR="$USER_HOME/Library/LaunchAgents"
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
        <string>/Applications/Conexor Local Agent/conexor-local-agent-macos-x64</string>
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

# Carregar LaunchAgent
launchctl load "$LAUNCH_AGENT_DIR/com.conexor.local-agent.plist" 2>/dev/null || true

# Iniciar o agente agora
"$INSTALL_DIR/conexor-local-agent-macos-x64" > /dev/null 2>&1 &

echo "✅ Conexor Local Agent instalado e iniciado!"
echo "📍 Acesse http://localhost:8080 para configurar"

exit 0
SCRIPT

chmod +x build-pkg/scripts/postinstall

# Criar o pacote (instala em /Library/Conexor que é permitido)
echo "🔨 Construindo pacote..."
pkgbuild --root build-pkg \
         --scripts build-pkg/scripts \
         --identifier "$IDENTIFIER" \
         --version "$VERSION" \
         --install-location "/" \
         ConexorLocalAgent-${VERSION}.pkg

echo "✅ Instalador criado: ConexorLocalAgent-${VERSION}.pkg"
echo "📏 Tamanho:"
ls -lh ConexorLocalAgent-${VERSION}.pkg

# Mover para pasta installers
mkdir -p installers
mv ConexorLocalAgent-${VERSION}.pkg installers/

# Limpar
rm -rf build-pkg

echo ""
echo "🎉 PRONTO!"
echo "📦 Instalador em: installers/ConexorLocalAgent-${VERSION}.pkg"
echo ""
echo "🧪 Para testar:"
echo "   sudo installer -pkg installers/ConexorLocalAgent-${VERSION}.pkg -target /"
