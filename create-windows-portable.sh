#!/bin/bash
# /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/create-windows-portable.sh
# Script para criar instalador portátil Windows (ZIP com batch installer)
# Pensado por: Alcélio Gomes
# 🚀 Conexor - Software de Gestão Inteligente

set -e

echo "🪟 Criando instalador portátil Windows para Conexor Local Agent..."

# Variáveis
APP_NAME="Conexor Local Agent"
VERSION="2.0.0"
WIN_DIR="build-windows"

# Criar estrutura
rm -rf "$WIN_DIR"
mkdir -p "$WIN_DIR"

# Copiar binário
echo "📦 Copiando binário Windows..."
cp dist/conexor-local-agent-win-x64.exe "$WIN_DIR/ConexorAgent.exe"

# Copiar ícone
cp assets/icon.ico "$WIN_DIR/icon.ico"

# Criar batch installer
cat > "$WIN_DIR/install.bat" << 'BATCH'
@echo off
:: Instalador Conexor Local Agent para Windows
:: Pensado por: Alcélio Gomes - Conexor

echo.
echo ========================================
echo  INSTALADOR CONEXOR LOCAL AGENT v2.0.0
echo ========================================
echo.

:: Verificar permissões de admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Este instalador requer permissoes de Administrador.
    echo Por favor, execute como Administrador.
    echo.
    pause
    exit /b 1
)

:: Definir pasta de instalação
set "INSTALL_DIR=%ProgramFiles%\Conexor Local Agent"

echo [1/5] Criando pasta de instalacao...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/5] Copiando arquivos...
copy /Y "%~dp0ConexorAgent.exe" "%INSTALL_DIR%\ConexorAgent.exe" >nul
copy /Y "%~dp0icon.ico" "%INSTALL_DIR%\icon.ico" >nul

echo [3/5] Configurando Firewall do Windows...
netsh advfirewall firewall delete rule name="Conexor Local Agent" >nul 2>&1
netsh advfirewall firewall add rule name="Conexor Local Agent" dir=in action=allow program="%INSTALL_DIR%\ConexorAgent.exe" enable=yes profile=private >nul

echo [4/5] Criando atalho no Menu Iniciar...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\Conexor Local Agent.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\ConexorAgent.exe'; $Shortcut.IconLocation = '%INSTALL_DIR%\icon.ico'; $Shortcut.Save()"

echo [5/5] Iniciando Conexor Local Agent...
start "" "%INSTALL_DIR%\ConexorAgent.exe"

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo O Conexor Local Agent foi instalado em:
echo %INSTALL_DIR%
echo.
echo O agente esta rodando em segundo plano.
echo Acesse: http://localhost:8080
echo.
pause
BATCH

# Criar batch uninstaller
cat > "$WIN_DIR/uninstall.bat" << 'BATCH'
@echo off
:: Desinstalador Conexor Local Agent para Windows
:: Pensado por: Alcélio Gomes - Conexor

echo.
echo ========================================
echo  DESINSTALADOR CONEXOR LOCAL AGENT
echo ========================================
echo.

:: Verificar permissões de admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Este desinstalador requer permissoes de Administrador.
    pause
    exit /b 1
)

set "INSTALL_DIR=%ProgramFiles%\Conexor Local Agent"

echo [1/4] Parando Conexor Local Agent...
taskkill /F /IM ConexorAgent.exe >nul 2>&1

echo [2/4] Removendo autostart...
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Conexor Local Agent.lnk" >nul 2>&1

echo [3/4] Removendo regra do Firewall...
netsh advfirewall firewall delete rule name="Conexor Local Agent" >nul 2>&1

echo [4/4] Removendo arquivos...
rd /S /Q "%INSTALL_DIR%" >nul 2>&1
del "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Conexor Local Agent.lnk" >nul 2>&1

echo.
echo ========================================
echo  DESINSTALACAO CONCLUIDA!
echo ========================================
echo.
pause
BATCH

# Criar README
cat > "$WIN_DIR/LEIA-ME.txt" << 'README'
========================================
 CONEXOR LOCAL AGENT v2.0.0
 Instalador Portátil para Windows
========================================

INSTALAÇÃO:
1. Clique com botão direito em "install.bat"
2. Selecione "Executar como Administrador"
3. Aguarde a instalação concluir

O QUE O INSTALADOR FAZ:
✅ Instala em: C:\Program Files\Conexor Local Agent
✅ Configura Firewall do Windows automaticamente
✅ Cria atalho no Menu Iniciar
✅ Inicia o agente em segundo plano
✅ Configura autostart automático no primeiro login

APÓS INSTALAÇÃO:
- O agente roda automaticamente em segundo plano
- Acesse: http://localhost:8080 para configurar
- Configure sua chave de conexão via interface web

DESINSTALAÇÃO:
1. Clique com botão direito em "uninstall.bat"
2. Selecione "Executar como Administrador"

REQUISITOS:
- Windows 10 ou superior (x64)
- Permissões de Administrador

SUPORTE:
📧 suporte@conexor.com
🌐 https://docs.conexor.com

🚀 Pensado por Alcélio Gomes - Conexor
README

# Criar arquivo ZIP
echo "📦 Criando arquivo ZIP..."
cd "$WIN_DIR"
zip -r "../installers/ConexorLocalAgent-Setup-${VERSION}.zip" . >/dev/null
cd ..

# Limpar
rm -rf "$WIN_DIR"

echo ""
echo "✅ Instalador Windows criado!"
echo "📦 Arquivo: installers/ConexorLocalAgent-Setup-${VERSION}.zip"
echo ""
echo "📏 Tamanho:"
ls -lh "installers/ConexorLocalAgent-Setup-${VERSION}.zip"
echo ""
echo "🧪 Para instalar no Windows:"
echo "   1. Extrair o ZIP"
echo "   2. Clicar com botão direito em install.bat"
echo "   3. Selecionar 'Executar como Administrador'"
echo ""
