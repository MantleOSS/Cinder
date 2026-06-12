@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

:: ═══════════════════════════════════════════════════════════════════
::  CINDER — Setup Script for Windows
::  by Mantle
:: ═══════════════════════════════════════════════════════════════════

cd /d "%~dp0"

:: Enable ANSI escape codes on Windows 10+
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: ─── Colors ─────────────────────────────────────────────────────────
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RESET=%ESC%[0m"
set "BOLD=%ESC%[1m"
set "DIM=%ESC%[2m"
set "AMBER=%ESC%[38;5;208m"
set "RED=%ESC%[38;5;196m"
set "GREEN=%ESC%[38;5;82m"
set "CYAN=%ESC%[38;5;117m"
set "GRAY=%ESC%[38;5;245m"
set "BG_AMBER=%ESC%[48;5;208m%ESC%[38;5;0m"
set "CHECK=%GREEN%✔%RESET%"
set "CROSS=%RED%✖%RESET%"
set "ARROW=%AMBER%▶%RESET%"

:: ─── Spinner Characters ─────────────────────────────────────────────
set "SPIN0=⠋"
set "SPIN1=⠙"
set "SPIN2=⠹"
set "SPIN3=⠸"
set "SPIN4=⠼"
set "SPIN5=⠴"
set "SPIN6=⠦"
set "SPIN7=⠧"
set "SPIN8=⠇"
set "SPIN9=⠏"

:: ═══════════════════════════════════════════════════════════════════
::  WELCOME SCREEN
:: ═══════════════════════════════════════════════════════════════════
cls
echo.
echo %AMBER%   ██████╗██╗███╗   ██╗██████╗ ███████╗██████╗ ███████╗███████╗ ██████╗ ███╗   ██╗███████╗
echo    ██╔════╝██║████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔════╝
echo    ██║     ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝███████╗█████╗  ██║   ██║██╔██╗ ██║█████╗  
echo    ██║     ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗╚════██║██╔══╝  ██║   ██║██║╚██╗██║██╔══╝  
echo    ╚██████╗██║██║ ╚████║██████╔╝███████╗██║  ██║███████║███████╗╚██████╔╝██║ ╚████║███████╗
echo    ╚═════╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝%RESET%
echo.
echo %DIM%                       ── by Mantle ──%RESET%
echo.
echo %GRAY%   Stream movies and TV shows for free. Personal use only.%RESET%
echo.
echo   ╔════════════════════════════════════════════════════════════╗
echo   ║  This script will set up Cinder on your Windows machine. ║
echo   ║  You'll need a free TMDB API key (we'll help you get one)║
echo   ╚════════════════════════════════════════════════════════════╝
echo.
echo   %AMBER%Press Enter to begin...%RESET%
set /p "="= >nul

:: ─── Step Counter ───────────────────────────────────────────────────
set "STEP=0"
set "TOTAL=7"

call :step_header "Check Prerequisites"

:: ═══════════════════════════════════════════════════════════════════
::  STEP 1: CHECK BUN
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Check Prerequisites"

echo   %ARROW% Checking for Bun...
where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%v in ('bun --version 2^>nul') do set "BUN_VER=%%v"
    echo   %CHECK% Bun !BUN_VER! found
) else (
    echo   %ARROW% %CYAN%Bun not found. Installing...%RESET%
    echo   %GRAY%   Running Bun installer for Windows...%RESET%
    powershell -c "irm bun.sh/install.ps1 | iex" >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo.
        echo   %CROSS% %RED%Failed to install Bun automatically.%RESET%
        echo   %GRAY%   Please install manually: https://bun.sh%RESET%
        echo   %GRAY%   Then restart your terminal and run this script again.%RESET%
        goto :error_exit
    )
    :: Refresh PATH
    set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
    where bun >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo.
        echo   %CROSS% %RED%Bun installed but not found in PATH.%RESET%
        echo   %GRAY%   Please close this terminal, open a new one, and run setup.bat again.%RESET%
        goto :error_exit
    )
    for /f "tokens=*" %%v in ('bun --version 2^>nul') do set "BUN_VER=%%v"
    echo   %CHECK% Bun !BUN_VER! installed
)

:: ═══════════════════════════════════════════════════════════════════
::  STEP 2: INSTALL DEPENDENCIES
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Install Dependencies"

echo   %ARROW% Installing packages...
bun install >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   %CROSS% %RED%Failed to install dependencies.%RESET%
    goto :error_exit
)
echo   %CHECK% Dependencies installed

:: ═══════════════════════════════════════════════════════════════════
::  STEP 3: PORT CHECK
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Configure Port"

set "PORT=3000"
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   %AMBER%⚠ Port 3000 is already in use.%RESET%
    echo.
    echo   Enter a different port %GRAY%(1024-65535)%RESET%:
    set /p "PORT=   Port: "
    :: Validate port
    if !PORT! LSS 1024 (
        echo   %CROSS% %RED%Port must be at least 1024.%RESET%
        goto :error_exit
    )
    if !PORT! GTR 65535 (
        echo   %CROSS% %RED%Port must be at most 65535.%RESET%
        goto :error_exit
    )
)
echo   %CHECK% Using port !PORT!

:: Save port for update script
echo !PORT!> .port

:: ═══════════════════════════════════════════════════════════════════
::  STEP 4: TMDB API KEY
:: ═══════════════════════════════════════════════════════════════════
call :step_header "TMDB API Key"

echo   %CYAN%You need a free TMDB API key to use Cinder.%RESET%
echo.
echo   How to get one:
echo.
echo   %AMBER%1.%RESET% Visit %CYAN%https://www.themoviedb.org/settings/api%RESET%
echo   %AMBER%2.%RESET% Create a free account (if you don't have one)
echo   %AMBER%3.%RESET% Click "Request an API Key" (choose Developer)
echo   %AMBER%4.%RESET% Fill in the form (any name/description works)
echo   %AMBER%5.%RESET% Copy your %BOLD%API Key (v3 auth)%RESET%
echo.
echo   %GRAY%Tip: The v3 API Key is a short string like "abc123def456..."%RESET%
echo.

:ask_key
set "TMDB_KEY="
set /p "TMDB_KEY=   🔑 Enter your TMDB API Key: "
if "!TMDB_KEY!"=="" (
    echo   %CROSS% %RED%Key cannot be empty. Please try again.%RESET%
    echo.
    goto :ask_key
)
echo   %CHECK% API key received

:: ═══════════════════════════════════════════════════════════════════
::  STEP 5: WRITE .env.local
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Write Configuration"

echo   %ARROW% Writing .env.local...
(
echo TMDB_API_KEY=!TMDB_KEY!
echo TMDB_ACCESS_TOKEN=
) > .env.local
echo   %CHECK% Configuration saved

:: ═══════════════════════════════════════════════════════════════════
::  STEP 6: BUILD
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Build Project"

echo   %ARROW% Building Cinder (this may take a moment)...
bun run build >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   %CROSS% %RED%Build failed.%RESET%
    echo   %GRAY%   Try running 'bun run build' manually to see the error.%RESET%
    goto :error_exit
)
echo   %CHECK% Build complete

:: ═══════════════════════════════════════════════════════════════════
::  STEP 7: START SERVER
:: ═══════════════════════════════════════════════════════════════════
call :step_header "Launch Server"

echo   %ARROW% Starting Cinder on port !PORT!...
echo.
set "PORT=!PORT!"
start "" /b bun run start >nul 2>&1

:: Give the server a moment to start
timeout /t 3 /nobreak >nul 2>&1

echo.
echo   ╔════════════════════════════════════════════════════════════╗
echo   ║                                                          ║
echo   ║   %AMBER%🔥  Cinder is running!%RESET%                              ║
echo   ║                                                          ║
echo   ║   Open your browser and visit:                           ║
echo   ║                                                          ║
echo   ║   %BOLD%%CYAN%http://localhost:!PORT!%RESET%                              ║
echo   ║                                                          ║
echo   ║   %GREEN%Enjoy! 🍿%RESET%                                           ║
echo   ║                                                          ║
echo   ╚════════════════════════════════════════════════════════════╝
echo.
echo   %GRAY%Press Ctrl+C to stop the server.%RESET%
echo.

:: Keep the window open
pause >nul
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  FUNCTIONS
:: ═══════════════════════════════════════════════════════════════════

:step_header
set /a STEP+=1
echo.
echo   %AMBER%━━━ Step %STEP% of %TOTAL%: %~1 ━━━%RESET%
echo.
goto :eof

:error_exit
echo.
echo   ╔════════════════════════════════════════════════════════════╗
echo   ║  %RED%✖  Setup failed%RESET%                                        ║
echo   ║  %GRAY%Check the errors above and try again.%RESET%                   ║
echo   ╚════════════════════════════════════════════════════════════╝
echo.
pause
exit /b 1
