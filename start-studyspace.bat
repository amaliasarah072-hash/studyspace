@echo off
title StudySpace - Personal Student Platform
echo ========================================================
echo               Launching StudySpace...
echo       A Personal Student Productivity & Study Platform
echo ========================================================
echo.
echo Starting local study sanctuary at http://localhost:8080 ...
start "" "http://localhost:8080/"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause

