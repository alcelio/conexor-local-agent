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

# Criar estrutura de diretórios
rm -rf build-pkg
mkdir -p "build-pkg/Applications/$APP_NAME"
mkdir -p build-pkg/scripts

# Copiar binário
echo "📦 Copiando binário..."
cp dist/conexor-local-agent-macos-x64 "build-pkg/Applications/$APP_NAME/"
chmod +x "build-pkg/Applications/$APP_NAME/conexor-local-agent-macos-x64"

# Criar script postinstall
cat > build-pkg/scripts/postinstall << 'SCRIPT'
#!/bin/bash
# Post-install script

# Tornar executável
chmod +x "/Applications/Conexor Local Agent/conexor-local-agent-macos-x64"

# Iniciar o agente em background
nohup "/Applications/Conexor Local Agent/conexor-local-agent-macos-x64" > /dev/null 2>&1 &

echo "✅ Conexor Local Agent instalado e iniciado!"
exit 0
SCRIPT

chmod +x build-pkg/scripts/postinstall

# Criar o pacote
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
