@echo off
REM Kill all SnaKTox services on Windows
REM Usage: scripts\kill-all-windows.bat

echo Stopping SnaKTox services...

REM Kill processes on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 3002
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002 ^| findstr LISTENING') do (
    echo Killing process on port 3002 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process on port 8000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo Done!


