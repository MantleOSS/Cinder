#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# ─── Cinder Update Script ────────────────────────────────────────────────────
# Ember/Amber ANSI color theme with beautiful TUI

# Colors
RST='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'

# Ember/Amber palette
AMBER='\033[38;2;232;137;12m'       # #E8890C primary
AMBER_BRIGHT='\033[38;2;255;179;71m' # lighter amber for accents
AMBER_DIM='\033[38;2;180;100;20m'    # darker amber
EMBER='\033[38;2;255;120;50m'        # orange-red accent
GOLD='\033[38;2;255;215;0m'          # gold for success
WHITE='\033[38;2;255;255;255m'
GRAY='\033[38;2;120;120;120m'
DARK_GRAY='\033[38;2;80;80;80m'
BG_DARK='\033[48;2;30;20;10m'        # dark warm background

# Box-drawing characters
TL='╔'; TR='╗'; BL='╚'; BR='╝'
HZ='═'; VT='║'
LT='╠'; RT='╣'
TT='╦'; BT='╩'
CX='╬'

# Spinner frames
SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

# State
STEP_NUM=0
TOTAL_STEPS=5

# ─── Helper Functions ────────────────────────────────────────────────────────

clear_screen() {
    printf '\033[2J\033[H'
}

# Print a horizontal rule
hr() {
    local width="${1:-60}"
    printf "${AMBER_DIM}${TL}"
    printf "%${width}s" | tr ' ' "${HZ}"
    printf "${TR}${RST}\n"
}

hr_bottom() {
    local width="${1:-60}"
    printf "${AMBER_DIM}${BL}"
    printf "%${width}s" | tr ' ' "${HZ}"
    printf "${BR}${RST}\n"
}

hr_mid() {
    local width="${1:-60}"
    printf "${AMBER_DIM}${LT}"
    printf "%${width}s" | tr ' ' "${HZ}"
    printf "${RT}${RST}\n"
}

# Step indicator with number
step_start() {
    STEP_NUM=$((STEP_NUM + 1))
    local label="$1"
    printf "\n"
    printf "${AMBER}${BOLD}  ${CX} Step ${STEP_NUM}/${TOTAL_STEPS}${RST}  ${AMBER_BRIGHT}${BOLD}${label}${RST}\n"
    printf "${AMBER_DIM}  ${VT}${RST}\n"
}

step_done() {
    local msg="${1:-Done}"
    printf "${AMBER_DIM}  ${VT}${RST}  ${GOLD}✔ ${msg}${RST}\n"
}

step_warn() {
    local msg="$1"
    printf "${AMBER_DIM}  ${VT}${RST}  ${EMBER}⚠ ${msg}${RST}\n"
}

step_info() {
    local msg="$1"
    printf "${AMBER_DIM}  ${VT}${RST}  ${GRAY}${msg}${RST}\n"
}

# Spinner that runs a command in background and shows animation
spin() {
    local label="$1"
    shift
    local cmd=("$@")

    # Run command in background, capture exit code
    local tmpout=$(mktemp)
    local tmperr=$(mktemp)

    ("${cmd[@]}" > "$tmpout" 2> "$tmperr") &
    local pid=$!

    local i=0
    while kill -0 "$pid" 2>/dev/null; do
        local frame="${SPINNER_FRAMES[$((i % ${#SPINNER_FRAMES[@]}))]}"
        printf "\r${AMBER_DIM}  ${VT}${RST}  ${AMBER_BRIGHT}${frame}${RST} ${GRAY}${label}${RST}   "
        i=$((i + 1))
        sleep 0.08
    done

    wait "$pid"
    local exit_code=$?

    # Clear spinner line
    printf "\r%80s\r" ""

    if [ $exit_code -ne 0 ]; then
        printf "${AMBER_DIM}  ${VT}${RST}  ${EMBER}✖ ${label} failed (exit ${exit_code})${RST}\n"
        if [ -s "$tmperr" ]; then
            printf "${DIM}"
            head -5 "$tmperr" | sed 's/^/    /'
            printf "${RST}"
        fi
        rm -f "$tmpout" "$tmperr"
        return $exit_code
    fi

    rm -f "$tmpout" "$tmperr"
    return 0
}

# Non-spinner version for quick commands
run_quiet() {
    local label="$1"
    shift
    "$@" > /dev/null 2>&1 && true
}

# ─── Banner ──────────────────────────────────────────────────────────────────

show_banner() {
    clear_screen
    printf "\n"
    printf "${AMBER}${BOLD}  /$$$$$$  /$$$$$$ /$$   /$$ /$$$$$$$  /$$$$$$$$ /$$$$$$$ ${RST}\n"
    printf "${AMBER}${BOLD} /$$__  $$|_  $$_/| $$$ | $$| $$__  $$| $$_____/| $$__  $$${RST}\n"
    printf "${AMBER}${BOLD}| $$  \__/  | $$  | $$$$| $$| $$  \ $$| $$      | $$  \ $${RST}\n"
    printf "${AMBER}${BOLD}| $$        | $$  | $$ $$ $$| $$  | $$| $$$$$   | $$$$$$$/${RST}    ${GOLD}${BOLD}U P D A T E${RST}\n"
    printf "${AMBER}${BOLD}| $$        | $$  | $$  $$$$| $$  | $$| $$__/   | $$__  $${RST}\n"
    printf "${AMBER}${BOLD}| $$    $$  | $$  | $$\  $$$| $$  | $$| $$      | $$  \ $${RST}\n"
    printf "${AMBER}${BOLD}|  $$$$$$/ /$$$$$$| $$ \  $$| $$$$$$$/| $$$$$$$$| $$  | $$${RST}\n"
    printf "${AMBER}${BOLD} \______/ |______/|__/  \__/|_______/ |________/|__/  |__/${RST}\n"
    printf "${AMBER}${BOLD}                                                           ${RST}\n"
    printf "\n"
    printf "${DIM}  Movie Streaming — Update Utility${RST}\n"
    printf "\n"
}

# ─── Success Banner ──────────────────────────────────────────────────────────

show_success() {
    local port="$1"
    local url="http://localhost:${port}"

    printf "\n"
    printf "${GOLD}${BOLD}  ╔══════════════════════════════════════════════════════════════╗${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}                                                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}    ${GOLD}${BOLD}   ★  Update Complete!  ★${RST}                                    ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}                                                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}  ${AMBER_BRIGHT}Cinder is running at:${RST}                                         ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}                                                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}    ${WHITE}${BOLD}➜  ${AMBER_BRIGHT}${BOLD}${url}${RST}                                      ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}                                                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}  ${DIM}Press Ctrl+C to stop the server${RST}                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ║${RST}                                                              ${GOLD}${BOLD}║${RST}\n"
    printf "${GOLD}${BOLD}  ╚══════════════════════════════════════════════════════════════╝${RST}\n"
    printf "\n"
}

# ─── Main Logic ──────────────────────────────────────────────────────────────

main() {
    show_banner

    # ── Step 1: Check Git & Pull ─────────────────────────────────────────────
    step_start "Check Git & Pull Updates"

    if [ -d ".git" ]; then
        step_info "Git repository detected, pulling latest changes..."
        if spin "Pulling from origin/main" git pull origin main; then
            step_done "Repository updated"
        else
            step_warn "Git pull encountered issues — continuing with local version"
        fi
    else
        step_warn "No .git directory found!"
        step_info "Auto-update requires a git clone (not a zip download)"
        step_info "To enable auto-updates, clone with: git clone <repo-url>"
        step_info "Continuing with dependency & build updates..."
    fi

    # ── Step 2: Install Dependencies ─────────────────────────────────────────
    step_start "Install Dependencies"

    if command -v bun &>/dev/null; then
        spin "Installing dependencies with bun" bun install
        step_done "Dependencies installed"
    else
        step_warn "bun not found! Attempting with npm..."
        if command -v npm &>/dev/null; then
            spin "Installing dependencies with npm" npm install
            step_done "Dependencies installed (npm)"
        else
            step_warn "No package manager found! Please install bun or npm"
            exit 1
        fi
    fi

    # ── Step 3: Build ────────────────────────────────────────────────────────
    step_start "Build Project"

    spin "Building with bun" bun run build
    step_done "Build complete"

    # ── Step 4: Restart Server ────────────────────────────────────────────────
    step_start "Restart Server"

    # Read port from .port file (default 3000)
    local PORT=3000
    if [ -f ".port" ]; then
        PORT=$(cat .port | tr -d '[:space:]')
        step_info "Using saved port: ${PORT}"
    else
        step_info "No .port file found, using default port: ${PORT}"
    fi

    # Kill any existing process on the same port
    local existing_pid
    existing_pid=$(lsof -ti :"$PORT" 2>/dev/null || true)
    if [ -n "$existing_pid" ]; then
        step_info "Stopping existing server on port ${PORT} (PID: ${existing_pid})..."
        kill $existing_pid 2>/dev/null || true
        sleep 1
        # Force kill if still running
        existing_pid=$(lsof -ti :"$PORT" 2>/dev/null || true)
        if [ -n "$existing_pid" ]; then
            kill -9 $existing_pid 2>/dev/null || true
            sleep 0.5
        fi
        step_done "Old server stopped"
    else
        step_info "No existing server found on port ${PORT}"
    fi

    # ── Step 5: Start Server ─────────────────────────────────────────────────
    step_start "Launch Server"

    # Export PORT for the server to use
    export PORT

    step_info "Starting Cinder on port ${PORT}..."
    bun run start &
    local server_pid=$!

    # Wait a moment and check if the process is still alive
    sleep 2
    if kill -0 "$server_pid" 2>/dev/null; then
        step_done "Server started (PID: ${server_pid})"
    else
        step_warn "Server process may have exited — check logs above"
    fi

    # ── Success ──────────────────────────────────────────────────────────────
    show_success "$PORT"
}

main "$@"
