@echo off
REM install-scripts/windows/desinstalar.bat
REM Desinstalador do Agente de Impressão NeuroAgentes

title NeuroAgentes - Desinstalador

echo ========================================
echo  NeuroAgentes - Desinstalador
echo ========================================
echo.

REM Verificar se está rodando como Administrador
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERRO] Precisa de permissoes de Administrador!
    echo Clique com botao direito e selecione "Executar como Administrador"
    pause
    exit /b 1
)

echo Tem certeza que deseja desinstalar o Agente de Impressao?
echo.
set /p CONFIRM="Digite SIM para confirmar: "

if /i NOT "%CONFIRM%"=="SIM" (
    echo Desinstalacao cancelada.
    pause
    exit /b 0
)

echo.
echo [1/4] Parando servico...

sc stop "NeuroAgentesImpressao" >nul 2>&1
timeout /t 2 /nobreak >nul

echo       OK
echo.

echo [2/4] Removendo servico...

sc delete "NeuroAgentesImpressao" >nul 2>&1
timeout /t 2 /nobreak >nul

echo       OK
echo.

echo [3/4] Removendo arquivos...

set INSTALL_DIR=C:\Program Files\NeuroAgentes
if exist "%INSTALL_DIR%\NeuroAgentesImpressao.exe" (
    del /F /Q "%INSTALL_DIR%\NeuroAgentesImpressao.exe" >nul 2>&1
)
if exist "%INSTALL_DIR%" (
    rmdir "%INSTALL_DIR%" >nul 2>&1
)

echo       OK
echo.

echo [4/4] Removendo atalho...

set DESKTOP=%USERPROFILE%\Desktop
if exist "%DESKTOP%\Reiniciar Agente Impressao.bat" (
    del /F /Q "%DESKTOP%\Reiniciar Agente Impressao.bat" >nul 2>&1
)

echo       OK
echo.

echo ========================================
echo  DESINSTALACAO CONCLUIDA!
echo ========================================
echo.

pause
