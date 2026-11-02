@echo off
title ORDEXA Cloudflare Tunnel
echo ========================================================
echo       ORDEXA - Cloudflare Quick Tunnel Launcher
echo ========================================================
echo Exposing unified Spring Boot Fullstack App (Port 8080)...
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8080
pause
