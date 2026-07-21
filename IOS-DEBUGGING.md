# Debugging an iOS Safari/Chrome tab from Linux, no Mac

Getting real Console + Network visibility into an iOS Safari (or iOS Chrome —
same WebKit engine underneath, same story) tab normally means owning a Mac
with Xcode's Web Inspector. This doc is how to do it from a Fedora/Linux
machine instead, with a real USB-connected iPhone and no Mac anywhere in the
loop. It came out of a debugging session where the Next.js dev server looked
completely unstyled on an iPhone over Tailscale (fine on localhost, fine on
the production Vercel deploy) — that specific bug turned out to be
`Strict-Transport-Security`/`upgrade-insecure-requests` being sent from the
dev server itself, already fixed in `next.config.ts`'s `securityHeadersFor()`
(PR #13). This doc isn't about that bug — it's about the tooling, which is
reusable for the next "something's only broken on an iPhone" investigation.

`scripts/debug-ios-safari.sh` automates everything below except the one-time
build step and the pairing dance, which need interactive `sudo` and physical
access to the phone.

## One-time setup

### 1. Install build deps

`ios_webkit_debug_proxy` isn't packaged for Fedora — build it from source:

```bash
sudo dnf install -y autoconf automake libtool libplist-devel \
  libimobiledevice-devel libimobiledevice-utils \
  libimobiledevice-glue-devel libusbmuxd-devel openssl-devel
```

### 2. Build `ios_webkit_debug_proxy`

The upstream source fails to build on modern GCC: a warning
(`-Wdiscarded-qualifiers` on a `strrchr` const-correctness issue) got
promoted to a hard error by `-Werror`, which older GCC didn't enforce.

```bash
git clone https://github.com/google/ios-webkit-debug-proxy.git
cd ios-webkit-debug-proxy
./autogen.sh
./configure CFLAGS="-Wno-error -Wno-discarded-qualifiers"
make
sudo make install
```

If a future version has more warnings-turned-errors than just that one,
`CFLAGS="-Wno-error"` alone is the blunt fallback — it disables
warnings-as-errors entirely instead of chasing each one down.

Note: `make install` also installs a udev rule that can auto-launch its own
`ios_webkit_debug_proxy` instance whenever a device is plugged in (flags like
`--no-frontend --config=null:9100,:9101-9201`). Keep this in mind later —
starting a second instance manually creates two competing proxies fighting
over the same device (see the port-conflict check below).

### 3. Get `remotedebug-ios-webkit-adapter`

The script clones this automatically if missing, into
`~/.cache/kothom-ios-debug-tools/` — deliberately **outside** the repo tree,
not somewhere under `scripts/`. TypeScript's type acquisition walks up parent
directories collecting every `node_modules/@types/*` it finds, not just the
closest one; cloning the adapter inside kothom's own tree means its
`gulp build` picks up kothom's own (newer) `@types/ms` package, which uses TS
utility types (`Uppercase`/`Lowercase`) the adapter's older tsconfig target
doesn't support, and the build fails with unrelated-looking TypeScript errors.
This was caught by actually running the script, not hypothesized — if you're
setting this up by hand instead, clone it somewhere outside any Node/TS
project tree for the same reason:

```bash
git clone https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter.git
cd remotedebug-ios-webkit-adapter
npm install
```

## Pairing the device (the actual time sink)

This is where a multi-hour rabbit hole lives if you don't know the shape of
the failure. Symptom: `idevice_id -l` returns nothing or
`ERROR: Unable to retrieve device list!`, and:

```bash
journalctl -u usbmuxd -n 20
```

shows the device connecting and then immediately being dropped — look for
this exact pattern, a `Connected to v2.0 device` line followed within about a
second by a `Removed device... Cannot find device entry while removing...
ignoring udev action unbind`, and specifically:

```
preflight_worker_handle_device_add: ERROR: Could not connect to lockdownd on device <UDID>, lockdown error -8
```

**That pattern means "flaky daemon state / device not unlocked+trusted yet,"
not "protocol incompatibility."** It's tempting to jump straight to
"iOS 17+'s USB-C pairing protocol isn't supported by classic
`libimobiledevice`/`usbmuxd`" — that's a real, documented, unresolved class of
issue upstream (see e.g. libimobiledevice/libimobiledevice#1491, #1567). But
try the cheap fix first:

```bash
sudo systemctl restart usbmuxd
```

Then **fully unplug the iPhone, wait ~5 seconds, and plug it back in once** —
don't wiggle the cable or replug repeatedly, that's what gets `usbmuxd` into
the stuck state in the first place. Unlock the phone and accept the "Trust
This Computer?" prompt if it appears, then:

```bash
idevice_id -l          # should print the UDID cleanly and fast
idevicepair pair        # may prompt for a passcode — enter it on the device
idevicepair validate    # should say SUCCESS
```

**Only run one tool against the device at a time while establishing initial
pairing.** Running `idevice_id` and `ios_webkit_debug_proxy` concurrently
starves/confuses `usbmuxd`'s single connection to the device and reproduces
the exact same symptom as a genuine protocol incompatibility — that's what
cost real time this session. Get `idevicepair validate` to SUCCESS with
nothing else running first, then move on.

## Starting the proxy and adapter

```bash
ios_webkit_debug_proxy > /tmp/iwdp.log 2>&1 &
curl -s http://localhost:9221/json   # should list the device by UDID
```

Check for a duplicate instance from the udev rule (see setup step 2) before
assuming a fresh one is the only one running:

```bash
ss -ltnp | grep -E '9221|9222|9100'
```

Kill any duplicate, then confirm the phone's actual tab shows up. The phone
must be **unlocked, with Safari (or Chrome) open and the tab on screen, not
backgrounded** — iOS only reports tabs from a genuinely foregrounded browser:

```bash
curl -s http://localhost:9222/json   # tab title/url + a devtoolsFrontendUrl
```

Then bridge to a real DevTools frontend:

```bash
cd remotedebug-ios-webkit-adapter
node out/index.js       # listens on :9000
curl -s http://localhost:9000/json
```

This returns a `devtoolsFrontendUrl` pointing at
`https://chrome-devtools-frontend.appspot.com/serve_file/...` — Google's own
maintained, current DevTools frontend. Open that URL in a desktop browser.
The frontend JS itself loads from the internet, but the actual debugging
traffic (console, network, DOM) goes over the local `ws://localhost:9000/...`
websocket back to the adapter — no data leaves the machine.

**Gotcha:** if `localhost:9000/json` returns `[]` while `localhost:9222/json`
shows the tab fine, check for the port conflict above first, then check
whether the phone re-locked or Safari got backgrounded between setup steps —
either one silently drops the tab list back to empty.

## Do NOT use the bundled `devtools.html`

`http://localhost:9222/devtools/devtools.html?ws=...` is bundled with
`ios_webkit_debug_proxy` but is a relic from roughly 2013 — the giveaway is
`<html manifest="27.0.1453.0.manifest">`, an HTML5 AppCache manifest, an API
removed from every modern browser years ago. It connects at the protocol
level without erroring, but the UI never renders or paints usable panels in
a current browser, so it looks like nothing is happening despite a live,
correctly-listed connection. This wasted real debugging time before the
cause was clear. Use the `remotedebug-ios-webkit-adapter` bridge above
instead — it's the one that actually works.
