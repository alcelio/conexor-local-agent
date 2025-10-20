@echo off
REM install-scripts/windows/instalador-simples.bat
REM Instalador automático do Agente de Impressão NeuroAgentes
REM Um clique e pronto!

title NeuroAgentes - Instalador do Agente de Impressao

echo ========================================
echo  NeuroAgentes - Instalador Automatico
echo ========================================
echo.

REM Verificar se está rodando como Administrador
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERRO] Este instalador precisa de permissoes de Administrador!
    echo.
    echo Clique com botao direito no arquivo e selecione:
    echo "Executar como Administrador"
    echo.
    pause
    exit /b 1
)

echo [1/6] Verificando arquivos...

REM Verificar se agent.exe existe
if not exist "%~dp0agent.exe" (
    echo [ERRO] Arquivo agent.exe nao encontrado!
    echo Certifique-se de que o agent.exe esta na mesma pasta deste instalador.
    pause
    exit /b 1
)

echo       OK - agent.exe encontrado
echo.

echo [2/6] Criando diretorio de instalacao...

REM Criar diretório de instalação
set INSTALL_DIR=C:\Program Files\NeuroAgentes
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo       OK - %INSTALL_DIR%
echo.

echo [3/6] Copiando arquivos...

REM Copiar executável
copy /Y "%~dp0agent.exe" "%INSTALL_DIR%\NeuroAgentesImpressao.exe" >nul

echo       OK - Executavel copiado
echo.

echo [4/6] Removendo servico antigo (se existir)...

REM Parar e remover serviço antigo se existir
sc query "NeuroAgentesImpressao" >nul 2>&1
if %errorLevel% EQU 0 (
    sc stop "NeuroAgentesImpressao" >nul 2>&1
    timeout /t 2 /nobreak >nul
    sc delete "NeuroAgentesImpressao" >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo       OK - Servico antigo removido
) else (
    echo       OK - Nenhum servico antigo
)
echo.

echo [5/6] Instalando como servico do Windows...

REM Criar serviço
sc create "NeuroAgentesImpressao" binPath= "\"%INSTALL_DIR%\NeuroAgentesImpressao.exe\"" start= auto DisplayName= "NeuroAgentes - Agente de Impressao" >nul

REM Configurar descrição
sc description "NeuroAgentesImpressao" "Agente local para impressao de recibos termicos via NeuroAgentes ERP" >nul

REM Configurar reinício automático em caso de falha
sc failure "NeuroAgentesImpressao" reset= 86400 actions= restart/5000/restart/10000/restart/30000 >nul

echo       OK - Servico instalado
echo.

echo [6/6] Criando atalho na area de trabalho...

REM Criar atalho na área de trabalho para reiniciar o agente
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=%DESKTOP%\Reiniciar Agente Impressao.bat

(
echo @echo off
echo title Reiniciar Agente de Impressao NeuroAgentes
echo echo.
echo echo ========================================
echo echo  Reiniciando Agente de Impressao
echo echo ========================================
echo echo.
echo net session ^>nul 2^>^&1
echo if %%errorLevel%% NEQ 0 ^(
echo     echo [ERRO] Precisa executar como Administrador!
echo     echo Clique com botao direito e selecione "Executar como Administrador"
echo     pause
echo     exit /b 1
echo ^)
echo echo Parando servico...
echo sc stop "NeuroAgentesImpressao" ^>nul 2^>^&1
echo timeout /t 2 /nobreak ^>nul
echo echo Iniciando servico...
echo sc start "NeuroAgentesImpressao" ^>nul 2^>^&1
echo if %%errorLevel%% EQU 0 ^(
echo     echo.
echo     echo [OK] Agente reiniciado com sucesso!
echo     echo.
echo ^) else ^(
echo     echo.
echo     echo [ERRO] Falha ao reiniciar. Entre em contato com o suporte.
echo     echo.
echo ^)
echo pause
) > "%SHORTCUT%"

echo       OK - Atalho criado na area de trabalho
echo.

echo [7/7] Iniciando servico...

REM Iniciar o serviço
sc start "NeuroAgentesImpressao" >nul 2>&1

if %errorLevel% EQU 0 (
    echo       OK - Servico iniciado!
) else (
    echo       AVISO - Servico instalado mas nao iniciou
    echo       Use o atalho da area de trabalho para iniciar
)

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo O que foi feito:
echo   [x] Agente instalado em: %INSTALL_DIR%
echo   [x] Servico do Windows criado
echo   [x] Inicio automatico configurado
echo   [x] Atalho criado na area de trabalho
echo.
echo O agente agora ira iniciar automaticamente
echo sempre que o Windows for reiniciado.
echo.
echo Se houver algum problema com impressao:
echo   ^> Clique no atalho "Reiniciar Agente Impressao"
echo   ^> na area de trabalho
echo.

pause
