#!/bin/bash
# /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/create-linux-installers.sh
# Script para criar instaladores Linux (.deb e portátil)
# Pensado por: Alcélio Gomes
# 🚀 Conexor - Software de Gestão Inteligente

set -e

echo "🐧 Criando instaladores Linux para Conexor Local Agent..."

# Variáveis
APP_NAME="conexor-local-agent"
VERSION="2.0.0"
ARCH="amd64"
DEB_DIR="build-deb"

# ====================================
# CRIAR PACOTE .DEB (Debian/Ubuntu)
# ====================================
echo ""
echo "📦 [1/2] Criando pacote .deb..."

# Limpar e criar estrutura
rm -rf "$DEB_DIR"
mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR/usr/local/bin"
mkdir -p "$DEB_DIR/usr/share/applications"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/512x512/apps"
mkdir -p "$DEB_DIR/etc/systemd/user"

# Copiar binário
cp dist/conexor-local-agent-linux-x64 "$DEB_DIR/usr/local/bin/$APP_NAME"
chmod +x "$DEB_DIR/usr/local/bin/$APP_NAME"

# Copiar ícone
cp assets/icon.png "$DEB_DIR/usr/share/icons/hicolor/512x512/apps/$APP_NAME.png"

# Criar arquivo .desktop
cat > "$DEB_DIR/usr/share/applications/$APP_NAME.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Conexor Local Agent
Comment=Agente local para integração com dispositivos periféricos
Exec=/usr/local/bin/$APP_NAME
Icon=$APP_NAME
Terminal=false
Categories=Utility;System;
StartupNotify=false
X-GNOME-Autostart-enabled=true
EOF

# Criar arquivo control
cat > "$DEB_DIR/DEBIAN/control" << EOF
Package: $APP_NAME
Version: $VERSION
Section: utils
Priority: optional
Architecture: $ARCH
Maintainer: Alcélio Gomes <suporte@conexor.com>
Description: Conexor Local Agent
 Agente local multiplataforma para integração com dispositivos periféricos.
 Permite que o sistema Conexor se comunique com impressoras térmicas,
 terminais POS e outros dispositivos USB/Serial.
Homepage: https://conexor.com
EOF

# Criar script postinst
cat > "$DEB_DIR/DEBIAN/postinst" << 'POSTINST'
#!/bin/bash
set -e

echo "🚀 Configurando Conexor Local Agent..."

# Criar diretório de autostart se não existir
mkdir -p "$HOME/.config/autostart"

# Copiar .desktop para autostart
cp /usr/share/applications/conexor-local-agent.desktop "$HOME/.config/autostart/"

# Iniciar o agente em background
nohup /usr/local/bin/conexor-local-agent > /dev/null 2>&1 &

echo "✅ Conexor Local Agent instalado e iniciado com sucesso!"
echo "📍 Acesse http://localhost:8080 para configurar"

exit 0
POSTINST

chmod +x "$DEB_DIR/DEBIAN/postinst"

# Criar script prerm (antes da remoção)
cat > "$DEB_DIR/DEBIAN/prerm" << 'PRERM'
#!/bin/bash
set -e

echo "🛑 Parando Conexor Local Agent..."

# Parar o processo
pkill -f conexor-local-agent || true

# Remover do autostart
rm -f "$HOME/.config/autostart/conexor-local-agent.desktop" || true

exit 0
PRERM

chmod +x "$DEB_DIR/DEBIAN/prerm"

# Construir pacote .deb
dpkg-deb --build "$DEB_DIR" "installers/${APP_NAME}_${VERSION}_${ARCH}.deb" 2>/dev/null || {
    echo "⚠️  dpkg-deb não disponível no macOS"
    echo "📦 Estrutura criada em: $DEB_DIR"
    echo "💡 Execute este script em uma máquina Linux para gerar o .deb"

    # Criar tarball como alternativa
    echo "📦 Criando tarball portátil..."
    tar -czf "installers/${APP_NAME}-${VERSION}-linux-x64.tar.gz" -C "$DEB_DIR" .
    echo "✅ Tarball criado: installers/${APP_NAME}-${VERSION}-linux-x64.tar.gz"
}

# ====================================
# CRIAR INSTALADOR PORTÁTIL (.tar.gz)
# ====================================
echo ""
echo "📦 [2/2] Criando instalador portátil..."

PORTABLE_DIR="build-portable"
rm -rf "$PORTABLE_DIR"
mkdir -p "$PORTABLE_DIR"

# Copiar binário
cp dist/conexor-local-agent-linux-x64 "$PORTABLE_DIR/$APP_NAME"
chmod +x "$PORTABLE_DIR/$APP_NAME"

# Criar script de instalação
cat > "$PORTABLE_DIR/install.sh" << 'INSTALL'
#!/bin/bash
# Instalador portátil Conexor Local Agent
# Pensado por: Alcélio Gomes - Conexor

set -e

echo ""
echo "========================================"
echo " INSTALADOR CONEXOR LOCAL AGENT v2.0.0"
echo "========================================"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
   INSTALL_DIR="/usr/local/bin"
   AUTOSTART_DIR="/etc/xdg/autostart"
   echo "📍 Instalação global (requer sudo)"
else
   INSTALL_DIR="$HOME/.local/bin"
   AUTOSTART_DIR="$HOME/.config/autostart"
   echo "📍 Instalação local (usuário atual)"
   mkdir -p "$INSTALL_DIR"
fi

echo ""
echo "[1/4] Copiando binário..."
cp conexor-local-agent "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/conexor-local-agent"

echo "[2/4] Criando atalho..."
mkdir -p "$AUTOSTART_DIR"
cat > "$AUTOSTART_DIR/conexor-local-agent.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Conexor Local Agent
Exec=$INSTALL_DIR/conexor-local-agent
Icon=printer
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
EOF

echo "[3/4] Adicionando ao PATH..."
if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo "export PATH=\$PATH:$INSTALL_DIR" >> "$HOME/.bashrc"
    echo "export PATH=\$PATH:$INSTALL_DIR" >> "$HOME/.profile"
fi

echo "[4/4] Iniciando Conexor Local Agent..."
nohup "$INSTALL_DIR/conexor-local-agent" > /dev/null 2>&1 &

echo ""
echo "========================================"
echo " INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "========================================"
echo ""
echo "O Conexor Local Agent foi instalado em:"
echo "$INSTALL_DIR/conexor-local-agent"
echo ""
echo "O agente está rodando em segundo plano."
echo "Acesse: http://localhost:8080"
echo ""
INSTALL

chmod +x "$PORTABLE_DIR/install.sh"

# Criar README
cat > "$PORTABLE_DIR/README.txt" << 'README'
========================================
 CONEXOR LOCAL AGENT v2.0.0
 Instalador Portátil para Linux
========================================

INSTALAÇÃO:

Opção 1 - Instalação Global (requer sudo):
  sudo ./install.sh

Opção 2 - Instalação Local (usuário atual):
  ./install.sh

O QUE O INSTALADOR FAZ:
✅ Instala o binário em /usr/local/bin ou ~/.local/bin
✅ Configura autostart automático
✅ Adiciona ao PATH do sistema
✅ Inicia o agente em segundo plano

APÓS INSTALAÇÃO:
- O agente roda automaticamente em segundo plano
- Acesse: http://localhost:8080 para configurar
- Configure sua chave de conexão via interface web

DESINSTALAÇÃO:
  sudo rm /usr/local/bin/conexor-local-agent
  rm ~/.config/autostart/conexor-local-agent.desktop
  pkill conexor-local-agent

REQUISITOS:
- Linux x64 (Ubuntu, Debian, Fedora, Arch, etc.)
- Kernel 3.10 ou superior

SUPORTE:
📧 suporte@conexor.com
🌐 https://docs.conexor.com

🚀 Pensado por Alcélio Gomes - Conexor
README

# Criar tarball portátil
tar -czf "installers/${APP_NAME}-${VERSION}-portable.tar.gz" -C "$PORTABLE_DIR" .

# Limpar
rm -rf "$DEB_DIR" "$PORTABLE_DIR"

echo ""
echo "✅ Instaladores Linux criados!"
echo ""
echo "📦 Arquivos criados:"
ls -lh installers/${APP_NAME}* 2>/dev/null || echo "   (verifique pasta installers/)"
echo ""
echo "🧪 Para instalar:"
echo "   DEB (Ubuntu/Debian):  sudo dpkg -i installers/${APP_NAME}_${VERSION}_${ARCH}.deb"
echo "   Portátil (qualquer):  tar -xzf installers/${APP_NAME}-${VERSION}-portable.tar.gz && ./install.sh"
echo ""
