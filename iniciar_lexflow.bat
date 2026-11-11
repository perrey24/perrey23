@echo off
setlocal
cd /d "%~dp0"

echo [LexFlow Colombia] Verificando servicio...
curl -s -m 1 http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [LexFlow Colombia] Iniciando supervisor en segundo plano...
    wscript.exe "%~dp0servicio_lexflow.vbs"
    timeout /t 2 /nobreak >nul
)

echo [LexFlow Colombia] Abriendo plataforma en http://localhost:3001...
start http://localhost:3001
exit
