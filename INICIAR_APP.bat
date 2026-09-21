@echo off
title Datos Orbet - La App de la Suerte
color 0B
echo ==========================================================
echo       DATOS ORBET - LA APP DE LA SUERTE (ANDROID)
echo ==========================================================
echo Iniciando servidor local y abriendo aplicacion...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
