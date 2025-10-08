;  /Users/alceliogomes/meus_projetos/neuroagentes/conexor-local-agent/install-scripts/windows-installer.nsh
; Script de instalação NSIS para Conexor Local Agent
; Pensado por: Alcélio Gomes
; 🚀 Conexor - Software de Gestão Inteligente

; ========================================
; CUSTOM INSTALL ACTIONS
; ========================================

!macro customInstall
  ; Copiar executável para pasta de instalação
  SetOutPath "$INSTDIR"
  File "${BUILD_RESOURCES_DIR}\dist\conexor-local-agent-win-x64.exe"

  ; Renomear para nome mais amigável
  Rename "$INSTDIR\conexor-local-agent-win-x64.exe" "$INSTDIR\ConexorAgent.exe"

  ; Criar regra no Firewall do Windows (sem pop-up para usuário)
  nsExec::ExecToLog 'netsh advfirewall firewall add rule name="Conexor Local Agent" dir=in action=allow program="$INSTDIR\ConexorAgent.exe" enable=yes profile=private'

  ; Iniciar o agente automaticamente após instalação
  Exec '"$INSTDIR\ConexorAgent.exe"'
!macroend

; ========================================
; CUSTOM UNINSTALL ACTIONS
; ========================================

!macro customUnInstall
  ; Parar o agente se estiver rodando
  nsExec::ExecToLog 'taskkill /F /IM ConexorAgent.exe'

  ; Remover regra do Firewall
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="Conexor Local Agent"'

  ; Remover autostart (se existir)
  Delete "$APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Conexor Local Agent.lnk"
!macroend
