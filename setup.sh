#!/usr/bin/env bash
set -e

# ═══════════════════════════════════════════════════════════════
#  Cinder — Setup Script
#  A beautiful TUI installer for the Cinder streaming app
# ═══════════════════════════════════════════════════════════════

cd "$(dirname "$0")"

# ── Color Palette (Ember/Amber Theme) ──────────────────────────
BRAND='\033[38;5;208m'       # #E8890C orange/amber
BRAND_BOLD='\033[1;38;5;208m'
SUCCESS='\033[38;5;82m'      # bright green
ERROR='\033[38;5;196m'       # bright red
ERROR_BOLD='\033[1;38;5;196m'
INFO='\033[38;5;117m'        # cyan
MUTED='\033[38;5;245m'       # gray
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'
BG_BRAND='\033[48;5;208m'
WHITE='\033[37m'

# ── Drawing Characters ─────────────────────────────────────────
TL='╔'; TR='╗'; BL='╚'; BR='╝'; H='═'; V='║'

# ── Step Counter ───────────────────────────────────────────────
TOTAL_STEPS=7
CURRENT_STEP=0

# ── Spinner State ──────────────────────────────────────────────
SPINNER_PID=""
SPINNER_MSG=""

# ── Utility Functions ──────────────────────────────────────────

brand()   { printf "${BRAND}%s${RESET}" "$1"; }
brand_b() { printf "${BRAND_BOLD}%s${RESET}" "$1"; }
success() { printf "${SUCCESS}%s${RESET}" "$1"; }
error()   { printf "${ERROR}%s${RESET}" "$1"; }
error_b() { printf "${ERROR_BOLD}%s${RESET}" "$1"; }
info()    { printf "${INFO}%s${RESET}" "$1"; }
muted()   { printf "${MUTED}%s${RESET}" "$1"; }
bold()    { printf "${BOLD}%s${RESET}" "$1"; }

# Print a horizontal rule
hr() {
  local width="${1:-60}"
  printf "${MUTED}%s${RESET}\n" "$(printf '%0.s═' $(seq 1 "$width"))"
}

# Print a box with content
box() {
  local width=60
  local inner=$((width - 2))
  printf "${MUTED}${TL}$(printf '%0.s═' $(seq 1 "$inner"))${TR}${RESET}\n"
  while IFS= read -r line; do
    local padded=$(printf "%-${inner}s" "$line")
    printf "${MUTED}${V}${RESET} ${padded} ${MUTED}${V}${RESET}\n"
  done <<< "$1"
  printf "${MUTED}${BL}$(printf '%0.s═' $(seq 1 "$inner"))${BR}${RESET}\n"
}

# Step header
step_header() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  printf "\n"
  hr 60
  printf "\n  ${BRAND_BOLD}Step ${CURRENT_STEP} of ${TOTAL_STEPS}${RESET}  ${MUTED}——${RESET}  ${BOLD}%s${RESET}\n\n" "$1"
}

# Success checkmark
check() {
  printf "  ${SUCCESS}✔${RESET}  %s\n" "$1"
}

# Fail X
fail() {
  printf "  ${ERROR}✖${RESET}  %s\n" "$1"
}

# Info bullet
bullet() {
  printf "    ${BRAND}›${RESET}  %s\n" "$1"
}

# Spinner
start_spinner() {
  SPINNER_MSG="$1"
  local chars='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  tput civis 2>/dev/null || true
  while true; do
    local c="${chars:$((i % 10)):1}"
    printf "\r  ${BRAND}%s${RESET}  %s   " "$c" "$SPINNER_MSG"
    i=$((i + 1))
    sleep 0.08
  done &
  SPINNER_PID=$!
}

stop_spinner() {
  if [ -n "$SPINNER_PID" ]; then
    kill "$SPINNER_PID" 2>/dev/null || true
    wait "$SPINNER_PID" 2>/dev/null || true
    SPINNER_PID=""
    # Clear the spinner line
    printf "\r%*s\r" 80 ""
  fi
  tput cnorm 2>/dev/null || true
}

# Run a command with spinner and handle errors
run_step() {
  local description="$1"
  shift
  start_spinner "$description"
  local rc=0
  "$@" &>/tmp/cinder-setup-err.log || rc=$?
  stop_spinner
  if [ $rc -ne 0 ]; then
    fail "$description"
    local err_content
    err_content=$(cat /tmp/cinder-setup-err.log 2>/dev/null || echo "Unknown error")
    printf "\n${ERROR}Error output:${RESET}\n"
    printf "${MUTED}%s${RESET}\n" "$err_content"
    return $rc
  fi
  check "$description"
  return 0
}

# Graceful error exit
die() {
  stop_spinner
  printf "\n\n"
  local width=60
  local inner=$((width - 2))
  printf "${ERROR}${TL}$(printf '%0.s═' $(seq 1 "$inner"))${TR}${RESET}\n"
  printf "${ERROR}${V}${RESET} ${ERROR_BOLD}Setup Failed${RESET}$(printf '%*s' $((inner - 14)) '')${ERROR}${V}${RESET}\n"
  printf "${ERROR}${V}${RESET} $(printf '%-'$inner's' "$1") ${ERROR}${V}${RESET}\n"
  printf "${ERROR}${BL}$(printf '%0.s═' $(seq 1 "$inner"))${BR}${RESET}\n"
  printf "\n  ${MUTED}Fix the issue above and re-run the script.${RESET}\n\n"
  exit 1
}

# ── Welcome Screen ─────────────────────────────────────────────
show_welcome() {
  clear
  printf "\n"
  printf "${BRAND}"
  cat << 'CINDER_ASCII'
  /$$$$$$  /$$$$$$ /$$   /$$ /$$$$$$$  /$$$$$$$$ /$$$$$$$ 
 /$$__  $$|_  $$_/| $$$ | $$| $$__  $$| $$_____/| $$__  $$
| $$  \__/  | $$  | $$$$| $$| $$  \ $$| $$      | $$  \ $$
| $$        | $$  | $$ $$ $$| $$  | $$| $$$$$   | $$$$$$$/
| $$        | $$  | $$  $$$$| $$  | $$| $$__/   | $$__  $$
| $$    $$  | $$  | $$\  $$$| $$  | $$| $$      | $$  \ $$
|  $$$$$$/ /$$$$$$| $$ \  $$| $$$$$$$/| $$$$$$$$| $$  | $$
 \______/ |______/|__/  \__/|_______/ |________/|__/  |__/
                                                          
                                                          
CINDER_ASCII
  printf "${RESET}"
  printf "\n"
  printf "${MUTED}                              ── by Mantle ──${RESET}\n"
  printf "\n"
  local width=60
  local inner=$((width - 2))
  printf "${MUTED}${TL}$(printf '%0.s═' $(seq 1 "$inner"))${TR}${RESET}\n"
  printf "${MUTED}${V}${RESET}  ${BRAND}🔥${RESET}  ${BOLD}Cinder${RESET} is a beautiful movie & TV streaming app     ${MUTED}${V}${RESET}\n"
  printf "${MUTED}${V}${RESET}     powered by TMDB. This script will get       ${MUTED}${V}${RESET}\n"
  printf "${MUTED}${V}${RESET}     everything set up in just a few steps.      ${MUTED}${V}${RESET}\n"
  printf "${MUTED}${BL}$(printf '%0.s═' $(seq 1 "$inner"))${BR}${RESET}\n"
  printf "\n"
  printf "  ${MUTED}Press${RESET} ${BOLD}Enter${RESET} ${MUTED}to begin the setup...${RESET}"
  read -r
}

# ── Step 1: Check Prerequisites ────────────────────────────────
check_prerequisites() {
  step_header "Check Prerequisites"

  printf "  ${MUTED}Checking for Bun runtime...${RESET}\n"

  if command -v bun &>/dev/null; then
    local bun_ver
    bun_ver=$(bun --version 2>/dev/null || echo "unknown")
    check "Bun is installed ${MUTED}(v${bun_ver})${RESET}"
  else
    bullet "Bun not found. Installing now..."
    printf "\n  ${INFO}⬇${RESET}  ${MUTED}Downloading Bun installer...${RESET}\n"

    if ! curl -fsSL https://bun.sh/install | bash; then
      die "Failed to install Bun. Please install manually: https://bun.sh"
    fi

    # Reload PATH to pick up bun
    export PATH="$HOME/.bun/bin:$PATH"

    # Also source shell rc if available
    if [ -f "$HOME/.bashrc" ]; then
      # shellcheck disable=SC1090
      source "$HOME/.bashrc" 2>/dev/null || true
    fi
    if [ -f "$HOME/.zshrc" ]; then
      # shellcheck disable=SC1091
      source "$HOME/.zshrc" 2>/dev/null || true
    fi

    if command -v bun &>/dev/null; then
      local bun_ver
      bun_ver=$(bun --version 2>/dev/null || echo "unknown")
      check "Bun installed successfully ${MUTED}(v${bun_ver})${RESET}"
    else
      die "Bun was installed but can't be found in PATH. Restart your terminal and re-run setup."
    fi
  fi
}

# ── Step 2: Install Dependencies ───────────────────────────────
install_deps() {
  step_header "Install Dependencies"

  if [ ! -f "package.json" ]; then
    die "package.json not found. Are you in the right directory?"
  fi

  run_step "Installing packages with Bun" bun install || die "Failed to install dependencies. Check your internet connection and try again."
}

# ── Step 3: Port Check ─────────────────────────────────────────
check_port() {
  step_header "Port Check"

  PORT=3000

  printf "  ${MUTED}Checking if port ${BOLD}3000${RESET} ${MUTED}is available...${RESET}\n"

  # Check if port is in use
  if lsof -i :3000 &>/dev/null || ss -tlnp 2>/dev/null | grep -q ':3000 '; then
    fail "Port 3000 is already in use"
    printf "\n"
    printf "  ${BRAND}⚡${RESET}  ${BOLD}Choose a different port:${RESET}\n"
    printf "  ${MUTED}Enter a port number (1024–65535) or press Enter for 3001:${RESET} "

    local input
    read -r input

    if [ -z "$input" ]; then
      PORT=3001
    else
      # Validate it's a number in range
      if [[ "$input" =~ ^[0-9]+$ ]] && [ "$input" -ge 1024 ] && [ "$input" -le 65535 ]; then
        PORT="$input"
      else
        die "Invalid port number: $input. Must be between 1024 and 65535."
      fi
    fi

    # Double-check new port
    if lsof -i :"$PORT" &>/dev/null || ss -tlnp 2>/dev/null | grep -q ":${PORT} "; then
      die "Port $PORT is also in use. Please free up a port and re-run setup."
    fi

    check "Port ${PORT} is available"
  else
    check "Port 3000 is available"
  fi

  # Write port to .port file
  echo "$PORT" > .port
  bullet "Port saved to ${MUTED}.port${RESET}"
}

# ── Step 4: TMDB API Key ───────────────────────────────────────
get_tmdb_key() {
  step_header "TMDB API Key"

  printf "  ${BRAND}🎬${RESET}  ${BOLD}Cinder needs a TMDB API key to fetch movie data.${RESET}\n\n"
  printf "  ${MUTED}Here's how to get one (it's free!):${RESET}\n\n"
  printf "  ${BRAND}1.${RESET}  Visit ${INFO}https://www.themoviedb.org/settings/api${RESET}\n"
  printf "  ${BRAND}2.${RESET}  Create a free account (or sign in)\n"
  printf "  ${BRAND}3.${RESET}  Request an API key under the API settings\n"
  printf "  ${BRAND}4.${RESET}  Copy the ${BOLD}API Key (v3 auth)${RESET} value\n"
  printf "\n"
  printf "  ${MUTED}──────────────────────────────────────────────────${RESET}\n"
  printf "\n"

  local api_key=""
  while [ -z "$api_key" ]; do
    printf "  ${BRAND}🔑${RESET}  ${BOLD}Enter your TMDB API Key:${RESET} "
    read -r api_key

    if [ -z "$api_key" ]; then
      printf "  ${ERROR}✖  API key cannot be empty. Please try again.${RESET}\n\n"
    fi
  done

  TMDB_API_KEY="$api_key"
  check "API key received ${MUTED}(${api_key:0:4}*****)${RESET}"
}

# ── Step 5: Write .env.local ──────────────────────────────────
write_env() {
  step_header "Write Configuration"

  printf "  ${MUTED}Writing${RESET} ${BOLD}.env.local${RESET} ${MUTED}...${RESET}\n"

  cat > .env.local << EOF
TMDB_API_KEY=${TMDB_API_KEY}
TMDB_ACCESS_TOKEN=
EOF

  check "Configuration written to ${MUTED}.env.local${RESET}"
}

# ── Step 6: Build ──────────────────────────────────────────────
build_app() {
  step_header "Build Application"

  run_step "Building Cinder with Bun" bun run build || die "Build failed. Check the error output above for details."
}

# ── Step 7: Start ──────────────────────────────────────────────
start_app() {
  step_header "Start Server"

  printf "  ${MUTED}Launching Cinder on port ${BOLD}${PORT}${RESET} ${MUTED}...${RESET}\n\n"

  # Determine start command — override port if not 3000
  if [ "$PORT" -ne 3000 ]; then
    PORT="$PORT" bun run start &
  else
    bun run start &
  fi

  SERVER_PID=$!

  # Wait briefly and check if process is still running
  sleep 3

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    die "Server failed to start. Check the output above for errors."
  fi

  # Done!
  printf "\n"
  local width=60
  local inner=$((width - 2))

  printf "${SUCCESS}${TL}$(printf '%0.s═' $(seq 1 "$inner"))${TR}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}                                                          ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}  ${BRAND_BOLD}🔥  Cinder is running!${RESET}                                  ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}                                                          ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}  ${BOLD}URL:${RESET}  ${INFO}http://localhost:${PORT}${RESET}                            ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}                                                          ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}  ${MUTED}PID:${RESET}  ${DIM}${SERVER_PID}${RESET}                                         ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}                                                          ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}  ${BRAND}🍿  Enjoy!${RESET}                                             ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${V}${RESET}                                                          ${SUCCESS}${V}${RESET}\n"
  printf "${SUCCESS}${BL}$(printf '%0.s═' $(seq 1 "$inner"))${BR}${RESET}\n"
  printf "\n"
}

# ── Main ───────────────────────────────────────────────────────
main() {
  show_welcome
  check_prerequisites
  install_deps
  check_port
  get_tmdb_key
  write_env
  build_app
  start_app
}

main "$@"
