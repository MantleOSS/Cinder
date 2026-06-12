@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

:: Enable ANSI escape sequences on Windows
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: ─── Cinder Update Script ──────────────────────────────────────────────────
:: Ember/Amber ANSI color theme with beautiful TUI

setlocal enabledelayedexpansion

:: Colors (ANSI 256-color approximations for broad compatibility)
for /f %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"
set "RST=%ESC%[0m"
set "BOLD=%ESC%[1m"
set "DIM=%ESC%[2m"

:: Ember/Amber palette
set "AMBER=%ESC%[38;5;208m"
set "AMBER_BRIGHT=%ESC%[38;5;220m"
set "AMBER_DIM=%ESC%[38;5;130m"
set "EMBER=%ESC%[38;5;202m"
set "GOLD=%ESC%[38;5;226m"
set "WHITE=%ESC%[38;5;231m"
set "GRAY=%ESC%[38;5;244m"
set "DARK_GRAY=%ESC%[38;5;240m"

:: Spinner frames
set "SPIN_0=⠋"
set "SPIN_1=⠙"
set "SPIN_2=⠹"
set "SPIN_3=⠸"
set "SPIN_4=⠼"
set "SPIN_5=⠴"
set "SPIN_6=⠦"
set "SPIN_7=⠧"
set "SPIN_8=⠇"
set "SPIN_9=⠏"

set "STEP_NUM=0"
set "TOTAL_STEPS=5"

:: ─── Banner ────────────────────────────────────────────────────────────────

cls
echo.
echo   %AMBER%%BOLD% /$$$$$$  /$$$$$$ /$$   /$$ /$$$$$$$  /$$$$$$$$ /$$$$$$$ %RST%
echo   %AMBER%%BOLD%/$$__  $$|_  $$_/| $$$ | $$| $$__  $$| $$_____/| $$__  $$%RST%
echo   %AMBER%%BOLD%| $$  \__/  | $$  | $$$$| $$| $$  \ $$| $$      | $$  \ $$%RST%
echo   %AMBER%%BOLD%| $$        | $$  | $$ $$ $$| $$  | $$| $$$$$   | $$$$$$$/%RST%    %GOLD%%BOLD%U P D A T E%RST%
echo   %AMBER%%BOLD%| $$        | $$  | $$  $$$$| $$  | $$| $$__/   | $$__  $$%RST%
echo   %AMBER%%BOLD%| $$    $$  | $$  | $$\  $$$| $$  | $$| $$      | $$  \ $$%RST%
echo   %AMBER%%BOLD%|  $$$$$$/ /$$$$$$| $$ \  $$| $$$$$$$/| $$$$$$$$| $$  | $$%RST%
echo   %AMBER%%BOLD% \______/ |______/|__/  \__/|_______/ |________/|__/  |__/%RST%
echo   %AMBER%%BOLD%                                                           %RST%
echo.
echo   %DIM%Movie Streaming — Update Utility%RST%
echo.

:: ─── Step 1: Check Git & Pull ──────────────────────────────────────────────

set /a STEP_NUM+=1
echo.
echo   %AMBER%%BOLD%╬ Step %STEP_NUM%/%TOTAL_STEPS%%RST%  %AMBER_BRIGHT%%BOLD%Check Git ^& Pull Updates%RST%
echo   %AMBER_DIM%║%RST%

if exist ".git" (
    echo   %AMBER_DIM%║%RST%  %GRAY%Git repository detected, pulling latest changes...%RST%
    echo   %AMBER_DIM%║%RST%  %AMBER_BRIGHT%%SPIN_0%%RST% %GRAY%Pulling from origin/main%RST%
    git pull origin main >nul 2>&1
    if !errorlevel! equ 0 (
        echo   %AMBER_DIM%║%RST%  %GOLD%✔ Repository updated%RST%
    ) else (
        echo   %AMBER_DIM%║%RST%  %EMBER%⚠ Git pull encountered issues — continuing with local version%RST%
    )
) else (
    echo   %AMBER_DIM%║%RST%  %EMBER%⚠ No .git directory found!%RST%
    echo   %AMBER_DIM%║%RST%  %GRAY%Auto-update requires a git clone (not a zip download)%RST%
    echo   %AMBER_DIM%║%RST%  %GRAY%To enable auto-updates, clone with: git clone ^<repo-url^>%RST%
    echo   %AMBER_DIM%║%RST%  %GRAY%Continuing with dependency ^& build updates...%RST%
)

:: ─── Step 2: Install Dependencies ──────────────────────────────────────────

set /a STEP_NUM+=1
echo.
echo   %AMBER%%BOLD%╬ Step %STEP_NUM%/%TOTAL_STEPS%%RST%  %AMBER_BRIGHT%%BOLD%Install Dependencies%RST%
echo   %AMBER_DIM%║%RST%

where bun >nul 2>&1
if !errorlevel! equ 0 (
    echo   %AMBER_DIM%║%RST%  %AMBER_BRIGHT%%SPIN_0%%RST% %GRAY%Installing dependencies with bun%RST%
    bun install >nul 2>&1
    if !errorlevel! equ 0 (
        echo   %AMBER_DIM%║%RST%  %GOLD%✔ Dependencies installed%RST%
    ) else (
        echo   %AMBER_DIM%║%RST%  %EMBER%⚠ bun install failed%RST%
        goto :error_exit
    )
) else (
    where npm >nul 2>&1
    if !errorlevel! equ 0 (
        echo   %AMBER_DIM%║%RST%  %AMBER_BRIGHT%%SPIN_0%%RST% %GRAY%Installing dependencies with npm%RST%
        call npm install >nul 2>&1
        if !errorlevel! equ 0 (
            echo   %AMBER_DIM%║%RST%  %GOLD%✔ Dependencies installed (npm)%RST%
        ) else (
            echo   %AMBER_DIM%║%RST%  %EMBER%⚠ npm install failed%RST%
            goto :error_exit
        )
    ) else (
        echo   %AMBER_DIM%║%RST%  %EMBER%⚠ No package manager found! Please install bun or npm%RST%
        goto :error_exit
    )
)

:: ─── Step 3: Build ─────────────────────────────────────────────────────────

set /a STEP_NUM+=1
echo.
echo   %AMBER%%BOLD%╬ Step %STEP_NUM%/%TOTAL_STEPS%%RST%  %AMBER_BRIGHT%%BOLD%Build Project%RST%
echo   %AMBER_DIM%║%RST%

echo   %AMBER_DIM%║%RST%  %AMBER_BRIGHT%%SPIN_0%%RST% %GRAY%Building with bun%RST%
call bun run build >nul 2>&1
if !errorlevel! equ 0 (
    echo   %AMBER_DIM%║%RST%  %GOLD%✔ Build complete%RST%
) else (
    echo   %AMBER_DIM%║%RST%  %EMBER%⚠ Build failed%RST%
    goto :error_exit
)

:: ─── Step 4: Restart Server ────────────────────────────────────────────────

set /a STEP_NUM+=1
echo.
echo   %AMBER%%BOLD%╬ Step %STEP_NUM%/%TOTAL_STEPS%%RST%  %AMBER_BRIGHT%%BOLD%Restart Server%RST%
echo   %AMBER_DIM%║%RST%

:: Read port from .port file (default 3000)
set "PORT=3000"
if exist ".port" (
    set /p PORT=<.port
    echo   %AMBER_DIM%║%RST%  %GRAY%Using saved port: !PORT!%RST%
) else (
    echo   %AMBER_DIM%║%RST%  %GRAY%No .port file found, using default port: 3000%RST%
)

:: Kill any existing process on the same port using netstat + taskkill
echo   %AMBER_DIM%║%RST%  %GRAY%Checking for existing server on port !PORT!...%RST%
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :!PORT! ^| findstr LISTENING 2^>nul') do (
    set "OLD_PID=%%a"
)
if defined OLD_PID (
    echo   %AMBER_DIM%║%RST%  %GRAY%Stopping existing server on port !PORT! (PID: !OLD_PID!)...%RST%
    taskkill /PID !OLD_PID! /F >nul 2>&1
    timeout /t 1 /nobreak >nul 2>&1
    echo   %AMBER_DIM%║%RST%  %GOLD%✔ Old server stopped%RST%
) else (
    echo   %AMBER_DIM%║%RST%  %GRAY%No existing server found on port !PORT!%RST%
)

:: ─── Step 5: Launch Server ─────────────────────────────────────────────────

set /a STEP_NUM+=1
echo.
echo   %AMBER%%BOLD%╬ Step %STEP_NUM%/%TOTAL_STEPS%%RST%  %AMBER_BRIGHT%%BOLD%Launch Server%RST%
echo   %AMBER_DIM%║%RST%

echo   %AMBER_DIM%║%RST%  %GRAY%Starting Cinder on port !PORT!...%RST%
set "PORT=!PORT!"
start "" /b bun run start >nul 2>&1
timeout /t 2 /nobreak >nul 2>&1
echo   %AMBER_DIM%║%RST%  %GOLD%✔ Server started%RST%

:: ─── Success ───────────────────────────────────────────────────────────────

echo.
echo   %GOLD%%BOLD%╔══════════════════════════════════════════════════════════════╗%RST%
echo   %GOLD%%BOLD%║%RST%                                                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%    %GOLD%%BOLD%  ★  Update Complete!  ★%RST%                                    %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%                                                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%  %AMBER_BRIGHT%Cinder is running at:%RST%                                         %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%                                                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%    %WHITE%%BOLD%➜  %AMBER_BRIGHT%%BOLD%http://localhost:!PORT!%RST%                                      %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%                                                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%  %DIM%Press Ctrl+C to stop the server%RST%                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%║%RST%                                                              %GOLD%%BOLD%║%RST%
echo   %GOLD%%BOLD%╚══════════════════════════════════════════════════════════════╝%RST%
echo.

goto :eof

:: ─── Error Exit ────────────────────────────────────────────────────────────

:error_exit
echo.
echo   %EMBER%%BOLD%╔══════════════════════════════════════════════════════════════╗%RST%
echo   %EMBER%%BOLD%║%RST%                                                              %EMBER%%BOLD%║%RST%
echo   %EMBER%%BOLD%║%RST%    %EMBER%%BOLD%✖  Update Failed%RST%                                            %EMBER%%BOLD%║%RST%
echo   %EMBER%%BOLD%║%RST%                                                              %EMBER%%BOLD%║%RST%
echo   %EMBER%%BOLD%║%RST%  %GRAY%Check the errors above and try again.%RST%                           %EMBER%%BOLD%║%RST%
echo   %EMBER%%BOLD%║%RST%                                                              %EMBER%%BOLD%║%RST%
echo   %EMBER%%BOLD%╚══════════════════════════════════════════════════════════════╝%RST%
echo.
exit /b 1
