#!/usr/bin/env bash
# Automates the repeatable parts of getting real Console/Network visibility
# into an iOS Safari (or iOS Chrome — same WebKit engine) tab from Linux,
# with no Mac. Full background, the pairing gotcha, and the one-time build
# steps this script can't automate (they need interactive sudo/physical
# access to the phone) are in IOS-DEBUGGING.md — read that first.
#
# Usage:
#   scripts/debug-ios-safari.sh
#
# Safe to re-run: detects already-running proxy/adapter instances and reuses
# them instead of erroring.

set -uo pipefail

# Deliberately OUTSIDE the repo tree, not scripts/.tools/. TypeScript's type
# acquisition walks up parent directories collecting every node_modules/@types
# it finds, not just the closest one — cloning the adapter inside kothom's own
# tree means its `gulp build` picks up kothom's (newer) @types/ms, which uses
# TS utility types (Uppercase/Lowercase) the adapter's older tsconfig target
# doesn't support, and the build fails with unrelated-looking TS errors.
# Confirmed by testing: this is not a hypothetical.
TOOLS_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/kothom-ios-debug-tools"
ADAPTER_DIR="$TOOLS_DIR/remotedebug-ios-webkit-adapter"
ADAPTER_REPO="https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter.git"

IWDP_LOG="/tmp/iwdp.log"
ADAPTER_LOG="/tmp/remotedebug-ios-webkit-adapter.log"

PROXY_PORT=9221
TAB_PORT=9222
UDEV_PORT=9100
ADAPTER_PORT=9000

POLL_TIMEOUT=30
POLL_INTERVAL=1

red() { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[33m%s\033[0m\n' "$1"; }

# --- 1. Check ios_webkit_debug_proxy is installed ---------------------------

if ! command -v ios_webkit_debug_proxy >/dev/null 2>&1; then
  red "ios_webkit_debug_proxy is not installed."
  cat <<'EOF'

Build it from source (not packaged for Fedora). Full detail in
IOS-DEBUGGING.md, quick version:

  sudo dnf install -y autoconf automake libtool libplist-devel \
    libimobiledevice-devel libimobiledevice-utils \
    libimobiledevice-glue-devel libusbmuxd-devel openssl-devel

  git clone https://github.com/google/ios-webkit-debug-proxy.git
  cd ios-webkit-debug-proxy
  ./autogen.sh
  ./configure CFLAGS="-Wno-error -Wno-discarded-qualifiers"
  make
  sudo make install

(If that CFLAGS combo doesn't cover a future version's warnings-turned-errors,
CFLAGS="-Wno-error" alone is the blunt fallback.)

This needs interactive sudo, so this script won't attempt it automatically.
Re-run this script once it's installed.
EOF
  exit 1
fi

green "ios_webkit_debug_proxy is installed."

# --- 2. Ensure remotedebug-ios-webkit-adapter is present ---------------------

if [ ! -d "$ADAPTER_DIR" ]; then
  yellow "remotedebug-ios-webkit-adapter not found, cloning into $ADAPTER_DIR ..."
  mkdir -p "$TOOLS_DIR"
  git clone "$ADAPTER_REPO" "$ADAPTER_DIR"
  (cd "$ADAPTER_DIR" && npm install)
else
  green "remotedebug-ios-webkit-adapter already present at $ADAPTER_DIR."
  if [ ! -d "$ADAPTER_DIR/node_modules" ]; then
    yellow "node_modules missing, running npm install ..."
    (cd "$ADAPTER_DIR" && npm install)
  fi
fi

# --- 3. Port conflict check ---------------------------------------------------

echo
echo "Checking for existing listeners on relevant ports..."
port_owner() {
  ss -ltnp 2>/dev/null | awk -v p=":$1" '$4 ~ p"$" {print}'
}

# PID actually holding a port, straight from the same ss output port_owner
# uses. Used instead of `pkill -f <pattern>` for the restart-if-stale path:
# a pattern match against the adapter's argv is fragile (it's launched as
# `node out/index.js` with a relative path, via `cd "$ADAPTER_DIR" &&`, so a
# pattern built from $ADAPTER_DIR never matches — confirmed live, the first
# version of this restart logic silently failed to kill the old adapter,
# which then blocked the new one from binding the port with a swallowed
# EADDRINUSE). The actual listening PID is unambiguous regardless of how the
# process was invoked.
port_pid() {
  port_owner "$1" | grep -o 'pid=[0-9]*' | head -n1 | cut -d= -f2
}

proxy_already_running=false
adapter_already_running=false

if [ -n "$(port_owner "$PROXY_PORT")" ]; then
  yellow "Port $PROXY_PORT already has a listener (likely ios_webkit_debug_proxy already running — possibly its own internal --config=null helper fork, not a udev rule — nothing in /etc/udev/rules.d or /usr/lib/udev/rules.d actually launches it). Reusing it."
  proxy_already_running=true
fi

if [ -n "$(port_owner "$UDEV_PORT")" ]; then
  yellow "Port $UDEV_PORT has a listener too — that's ios_webkit_debug_proxy's own internal --config=null:9100,... helper fork. If you also start one manually you'll get two competing proxies. This script will NOT start a second proxy if one is already listening on $PROXY_PORT."
fi

if [ -n "$(port_owner "$TAB_PORT")" ]; then
  yellow "Port $TAB_PORT already has a listener. Assuming it's the proxy's tab-list endpoint; reusing it."
fi

if [ -n "$(port_owner "$ADAPTER_PORT")" ]; then
  yellow "Port $ADAPTER_PORT already has a listener (likely remotedebug-ios-webkit-adapter already running). Reusing it."
  adapter_already_running=true
fi

# --- 3b. Detect a stale (listening but dead-inside) proxy --------------------
#
# A listening port on $PROXY_PORT is not proof the proxy actually works: if
# usbmuxd gets restarted (e.g. per the pairing troubleshooting in
# IOS-DEBUGGING.md) while an existing ios_webkit_debug_proxy is already
# running, its usbmuxd connection dies (iwdp's own log shows "ssl recv
# failed: Broken pipe") but the process keeps running and keeps listening —
# it just never sees the device again. Every symptom looks identical to "the
# phone isn't unlocked yet": ports all show listeners, but no tab ever shows
# up, right up until the 30s timeout. This cost real time diagnosing live,
# since `ss -ltnp` alone can't tell a healthy proxy from a stale one.
#
# The fix: $PROXY_PORT/json lists attached devices by UDID as soon as iwdp
# sees them via usbmuxd — independent of whether Safari's tab is even open,
# well before $TAB_PORT is populated. If idevice_id already sees the phone
# but a *reused* proxy doesn't list it within a few seconds, the proxy is
# stale, not the phone. Restart it rather than waiting out the full timeout
# only to report a misleading "is your phone unlocked?" checklist.
if [ "$proxy_already_running" = true ]; then
  udid="$(idevice_id -l 2>/dev/null | head -n1)"
  if [ -n "$udid" ]; then
    echo "Checking existing proxy already sees paired device $udid ..."
    proxy_sees_device=false
    for _ in $(seq 1 5); do
      if curl -s --max-time 2 "http://localhost:$PROXY_PORT/json" 2>/dev/null | grep -qF "$udid"; then
        proxy_sees_device=true
        break
      fi
      sleep 1
    done

    if [ "$proxy_sees_device" = false ]; then
      yellow "Existing proxy on port $PROXY_PORT doesn't see device $udid even though idevice_id does — it's almost certainly stale (a dead usbmuxd connection from before a restart; check $IWDP_LOG for 'Broken pipe'). Restarting it instead of reusing it."
      # ios_webkit_debug_proxy also runs a second --config=null helper
      # process (on $UDEV_PORT) that needs killing too, so this kills by
      # port rather than assuming a single PID.
      for p in "$PROXY_PORT" "$UDEV_PORT"; do
        pid="$(port_pid "$p")"
        [ -n "$pid" ] && kill "$pid" 2>/dev/null
      done
      # The adapter's own tab list is downstream of the proxy, so a stale
      # proxy leaves it just as stuck — restart both together.
      adapter_pid="$(port_pid "$ADAPTER_PORT")"
      [ -n "$adapter_pid" ] && kill "$adapter_pid" 2>/dev/null
      sleep 1
      proxy_already_running=false
      adapter_already_running=false
    else
      green "Existing proxy already sees the device. Reusing it."
    fi
  fi
fi

# --- 4. Start ios_webkit_debug_proxy if needed -------------------------------

if [ "$proxy_already_running" = false ]; then
  echo
  echo "Starting ios_webkit_debug_proxy (log: $IWDP_LOG) ..."
  nohup ios_webkit_debug_proxy >"$IWDP_LOG" 2>&1 &
  disown
  sleep 1
else
  echo "Skipping proxy start — already running."
fi

# --- 5. Start the adapter if needed -----------------------------------------

if [ "$adapter_already_running" = false ]; then
  echo "Starting remotedebug-ios-webkit-adapter (log: $ADAPTER_LOG) ..."
  (cd "$ADAPTER_DIR" && nohup node out/index.js >"$ADAPTER_LOG" 2>&1 &)
  sleep 1
else
  echo "Skipping adapter start — already running."
fi

# --- 6. Poll for a tab --------------------------------------------------------

echo
echo "Waiting for the phone's tab to show up (unlock it, open Safari/Chrome, keep it foregrounded)..."

elapsed=0
found=false
frontend_url=""

while [ "$elapsed" -lt "$POLL_TIMEOUT" ]; do
  adapter_json="$(curl -s "http://localhost:$ADAPTER_PORT/json" 2>/dev/null)"

  if [ -n "$adapter_json" ] && [ "$adapter_json" != "[]" ]; then
    frontend_url="$(printf '%s' "$adapter_json" | grep -o '"devtoolsFrontendUrl"\s*:\s*"[^"]*"' | head -n1 | sed -E 's/.*: *"([^"]*)"/\1/')"
    if [ -n "$frontend_url" ]; then
      found=true
      break
    fi
  fi

  sleep "$POLL_INTERVAL"
  elapsed=$((elapsed + POLL_INTERVAL))
done

echo

if [ "$found" = true ]; then
  green "Found a live tab. Open this URL in a desktop browser:"
  echo
  echo "  $frontend_url"
  echo
  echo "(The frontend JS loads from chrome-devtools-frontend.appspot.com; the"
  echo "actual debugging traffic goes over the local ws://localhost:$ADAPTER_PORT/... websocket.)"
  exit 0
else
  red "No tab found after ${POLL_TIMEOUT}s."
  cat <<EOF

Checklist:
  - Is the iPhone unlocked?
  - Is Safari (or Chrome) open with the tab actually on screen, not backgrounded?
  - Is Web Inspector enabled? (Settings > Safari > Advanced > Web Inspector)
  - Is the phone still plugged in and trusted? Try:
      idevice_id -l
    If that prints nothing, see the pairing section in IOS-DEBUGGING.md —
    most commonly this means usbmuxd needs a restart + a single clean replug.
  - Raw proxy tab list (should show the device even before a tab is open):
      curl -s http://localhost:$TAB_PORT/json
  - Logs:
      $IWDP_LOG
      $ADAPTER_LOG
EOF
  exit 1
fi
