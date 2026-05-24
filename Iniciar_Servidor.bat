@echo off
title Servidor Entre Nieves
echo ========================================================
echo   INICIANDO EL SERVIDOR LOCAL - ENTRE NIEVES
echo ========================================================
echo.
echo 1. Abriendo la aplicacion en tu navegador...
start http://localhost:3000
echo.
echo 2. Encendiendo el motor de React y Vite...
cd /d "C:\Users\usuario\Documents\RODRIGO\GEOCONECTA\Cabañas"
cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
pause
