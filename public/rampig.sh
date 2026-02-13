#!/bin/bash
# RAMpig 🐷 — Find what's eating your RAM
# Usage: curl -s renard.cool/rampig.sh | bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
PINK='\033[0;35m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# Check we're on macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo ""
  echo -e "  ${RED}Oink! 🐷 RAMpig only runs on macOS.${NC}"
  echo ""
  exit 1
fi

# Check pbcopy exists
if ! command -v pbcopy &> /dev/null; then
  echo -e "${RED}pbcopy not found — are you really on macOS?${NC}"
  exit 1
fi

echo ""
echo -e "  ${PINK}┌─────────────────────────────────────────────┐${NC}"
echo -e "  ${PINK}│${NC}  🐷 ${BOLD}RAMpig${NC} — sniffing out memory hogs...    ${PINK}│${NC}"
echo -e "  ${PINK}└─────────────────────────────────────────────┘${NC}"
echo ""

TMPFILE=$(mktemp /tmp/rampig.XXXXXX)
trap "rm -f $TMPFILE" EXIT

# ── Helpers ───────────────────────────────────────────────────

# Get a vm_stat field as a raw page count (strips trailing period and spaces)
get_vm_pages() {
  local label="$1"
  local val
  val=$(grep "^${label}" /tmp/rampig_vmstat.txt 2>/dev/null | awk -F: '{print $2}' | tr -d ' .')
  echo "${val:-0}"
}

# Convert pages to GB (uses $PAGE_SIZE), ensures leading zero
pages_to_gb() {
  local val
  val=$(echo "scale=2; $1 * $PAGE_SIZE / 1073741824" | bc 2>/dev/null || echo "0")
  # Add leading zero for values like ".10"
  [[ "$val" == .* ]] && val="0${val}"
  echo "$val"
}

# ── Collect data ──────────────────────────────────────────────

echo "=== RAMPIG MEMORY SNAPSHOT ===" > "$TMPFILE"
echo "Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> "$TMPFILE"
echo "" >> "$TMPFILE"

# System info
echo "--- SYSTEM INFO ---" >> "$TMPFILE"
sw_vers >> "$TMPFILE" 2>/dev/null || echo "sw_vers unavailable" >> "$TMPFILE"

mem_bytes=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
if [[ "$mem_bytes" -gt 0 ]]; then
  mem_gb=$(echo "scale=1; $mem_bytes / 1073741824" | bc)
  echo "Total RAM: ${mem_gb} GB" >> "$TMPFILE"
else
  mem_gb="?"
  echo "Total RAM: unknown" >> "$TMPFILE"
fi

cpu_brand=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "unknown")
echo "CPU: ${cpu_brand}" >> "$TMPFILE"

arch=$(uname -m)
if [[ "$arch" == "arm64" ]]; then
  PAGE_SIZE=16384
  echo "Architecture: Apple Silicon (arm64)" >> "$TMPFILE"
else
  PAGE_SIZE=4096
  echo "Architecture: Intel (x86_64)" >> "$TMPFILE"
fi

# Uptime
echo "Uptime: $(uptime | sed 's/.*up /up /' | sed 's/,.*//')" >> "$TMPFILE"

# Disk free
disk_info=$(df -h / 2>/dev/null | tail -1 | awk '{print $4 " free of " $2}')
echo "Disk: ${disk_info}" >> "$TMPFILE"

echo "" >> "$TMPFILE"

# ── Pre-computed memory breakdown ─────────────────────────────

echo -e "  ${DIM}Scanning memory...${NC}"

vm_stat > /tmp/rampig_vmstat.txt 2>/dev/null

pages_active=$(get_vm_pages "Pages active")
pages_wired=$(get_vm_pages "Pages wired down")
pages_compressor=$(get_vm_pages "Pages occupied by compressor")
pages_free=$(get_vm_pages "Pages free")
pages_inactive=$(get_vm_pages "Pages inactive")
pages_speculative=$(get_vm_pages "Pages speculative")
pages_purgeable=$(get_vm_pages "Pages purgeable")
pageouts=$(get_vm_pages "Pageouts")
swapins=$(get_vm_pages "Swapins")
swapouts=$(get_vm_pages "Swapouts")

gb_active=$(pages_to_gb "$pages_active")
gb_wired=$(pages_to_gb "$pages_wired")
gb_compressed=$(pages_to_gb "$pages_compressor")
gb_free=$(pages_to_gb "$pages_free")
gb_inactive=$(pages_to_gb "$pages_inactive")
gb_used=$(echo "scale=2; $gb_active + $gb_wired + $gb_compressed" | bc 2>/dev/null || echo "0")
[[ "$gb_used" == .* ]] && gb_used="0${gb_used}"

# Memory pressure (100 = no pressure, lower = worse)
mem_pressure=$(sysctl -n kern.memorystatus_level 2>/dev/null || echo "unknown")

echo "--- MEMORY BREAKDOWN (pre-computed) ---" >> "$TMPFILE"
echo "Active:      ${gb_active} GB  (apps currently using memory)" >> "$TMPFILE"
echo "Wired:       ${gb_wired} GB  (system memory that can't be freed)" >> "$TMPFILE"
echo "Compressed:  ${gb_compressed} GB  (memory macOS squeezed to save space)" >> "$TMPFILE"
echo "Inactive:    ${gb_inactive} GB  (recently used, reclaimable)" >> "$TMPFILE"
echo "Free:        ${gb_free} GB" >> "$TMPFILE"
echo "Used total:  ${gb_used} GB of ${mem_gb} GB" >> "$TMPFILE"
echo "Pressure:    ${mem_pressure}%  (100% = no pressure, lower = worse)" >> "$TMPFILE"
echo "Pageouts:    ${pageouts}  (times macOS had to spill to disk)" >> "$TMPFILE"
echo "Swapins:     ${swapins}  /  Swapouts: ${swapouts}" >> "$TMPFILE"
echo "" >> "$TMPFILE"

# Raw vm_stat as backup
echo "--- VM_STAT (raw) ---" >> "$TMPFILE"
cat /tmp/rampig_vmstat.txt >> "$TMPFILE"
rm -f /tmp/rampig_vmstat.txt
echo "" >> "$TMPFILE"

# ── Process grouping ─────────────────────────────────────────

echo -e "  ${DIM}Rounding up processes...${NC}"

echo "--- TOP APPS (grouped by app, sorted by total memory) ---" >> "$TMPFILE"

# Get per-process RSS in KB, map to app name, group, sum, sort descending
# Also output grand total and small-process bucket to a sidecar file
ps -axm -o rss=,comm= 2>/dev/null | \
  awk '
    function map_app(name) {
      # VS Code
      if (name ~ /^Code Helper/) return "VS Code"
      if (name == "Code" || name == "Code - Insiders") return "VS Code"
      # Cursor
      if (name ~ /^Cursor Helper/) return "Cursor"
      if (name == "Cursor") return "Cursor"
      # Chrome
      if (name ~ /^Google Chrome Helper/) return "Chrome"
      if (name == "Google Chrome") return "Chrome"
      # Arc
      if (name ~ /^Arc Helper/) return "Arc"
      if (name == "Arc") return "Arc"
      # Brave
      if (name ~ /^Brave Browser Helper/) return "Brave"
      if (name == "Brave Browser") return "Brave"
      # Edge
      if (name ~ /^Microsoft Edge Helper/) return "Edge"
      if (name == "Microsoft Edge") return "Edge"
      # Firefox
      if (name == "firefox" || name == "Firefox") return "Firefox"
      if (name == "plugin-container") return "Firefox"
      if (name ~ /^Firefox/) return "Firefox"
      # Safari
      if (name ~ /^com\.apple\.WebKit/) return "Safari"
      if (name == "Safari" || name == "SafariViewService") return "Safari"
      # Claude desktop app (capitalized = app, lowercase = CLI)
      if (name ~ /^Claude Helper/) return "Claude (app)"
      if (name == "Claude") return "Claude (app)"
      # Docker
      if (name ~ /^com\.docker/) return "Docker"
      if (name == "Docker Desktop") return "Docker"
      # Slack
      if (name ~ /^Slack Helper/) return "Slack"
      if (name == "Slack") return "Slack"
      # Discord
      if (name ~ /^Discord Helper/) return "Discord"
      if (name == "Discord") return "Discord"
      # Spotify
      if (name ~ /^Spotify Helper/) return "Spotify"
      if (name == "Spotify") return "Spotify"
      # Teams
      if (name ~ /^Microsoft Teams/) return "Teams"
      if (name ~ /^Teams Helper/) return "Teams"
      # Notion
      if (name ~ /^Notion Helper/) return "Notion"
      if (name == "Notion") return "Notion"
      # Figma
      if (name ~ /^Figma Helper/) return "Figma"
      if (name == "Figma") return "Figma"
      # 1Password
      if (name ~ /^1Password/) return "1Password"
      # Obsidian
      if (name ~ /^Obsidian Helper/) return "Obsidian"
      if (name == "Obsidian") return "Obsidian"
      # Linear
      if (name ~ /^Linear Helper/) return "Linear"
      if (name == "Linear") return "Linear"
      # Postman
      if (name ~ /^Postman/) return "Postman"
      # Logseq
      if (name ~ /^Logseq Helper/) return "Logseq"
      if (name == "Logseq") return "Logseq"
      # Whatsapp
      if (name ~ /^WhatsApp/) return "WhatsApp"
      # Telegram
      if (name == "Telegram") return "Telegram"
      # Signal
      if (name ~ /^Signal Helper/) return "Signal"
      if (name == "Signal") return "Signal"
      # Zoom
      if (name ~ /^zoom/) return "Zoom"
      if (name ~ /^CptHost/) return "Zoom"
      # No mapping — keep original
      return name
    }
    $1 ~ /^[0-9]+$/ {
      rss = $1
      cmd = $2
      for (i = 3; i <= NF; i++) cmd = cmd " " $i
      n = split(cmd, parts, "/")
      name = parts[n]
      gsub(/[[:space:]]+$/, "", name)
      if (name == "" || rss == 0) next
      grand_total += rss
      app = map_app(name)
      mem[app] += rss
      count[app]++
    }
    END {
      listed_kb = 0
      small_kb = 0
      small_count = 0
      for (app in mem) {
        mb = mem[app] / 1024
        if (mb >= 10) {
          listed_kb += mem[app]
          if (mb >= 1024) {
            printf "%09.1f|%.1f GB  %s", mb, mb / 1024, app
          } else {
            printf "%09.1f|%.0f MB  %s", mb, mb, app
          }
          if (count[app] > 1) {
            printf " (%d processes)", count[app]
          }
          printf "\n"
        } else {
          small_kb += mem[app]
          small_count += count[app]
        }
      }
      # Output summary to stderr (captured separately)
      printf "%d %d %d\n", grand_total, small_kb, small_count > "/dev/stderr"
    }
  ' 2>/tmp/rampig_ps_totals.txt | sort -t'|' -k1 -rn | cut -d'|' -f2 | head -25 >> "$TMPFILE"

# Read the totals from the sidecar
read ps_grand_total_kb ps_small_kb ps_small_count < /tmp/rampig_ps_totals.txt 2>/dev/null
rm -f /tmp/rampig_ps_totals.txt

# Add small processes bucket
if [[ -n "$ps_small_count" && "$ps_small_count" -gt 0 ]]; then
  small_mb=$(echo "scale=0; $ps_small_kb / 1024" | bc 2>/dev/null || echo "0")
  echo "${small_mb} MB  other (${ps_small_count} small processes under 10 MB each)" >> "$TMPFILE"
fi

echo "" >> "$TMPFILE"

# ── Memory accounting summary ────────────────────────────────

echo "--- MEMORY ACCOUNTING ---" >> "$TMPFILE"
if [[ -n "$ps_grand_total_kb" && "$ps_grand_total_kb" -gt 0 ]]; then
  ps_total_gb=$(echo "scale=2; $ps_grand_total_kb / 1048576" | bc 2>/dev/null || echo "0")
  [[ "$ps_total_gb" == .* ]] && ps_total_gb="0${ps_total_gb}"
  echo "App process memory (sum of all process RSS): ${ps_total_gb} GB" >> "$TMPFILE"
  echo "Used total (from vm_stat): ${gb_used} GB" >> "$TMPFILE"
  overhead_gb=$(echo "scale=2; $gb_used - $ps_total_gb" | bc 2>/dev/null || echo "0")
  [[ "$overhead_gb" == .* ]] && overhead_gb="0${overhead_gb}"
  # Handle negative (ps can sometimes exceed vm_stat due to shared pages)
  is_negative=$(echo "$overhead_gb < 0" | bc 2>/dev/null)
  if [[ "$is_negative" == "1" ]]; then
    overhead_gb="0"
  fi
  echo "System overhead: ~${overhead_gb} GB (kernel, drivers, GPU, file cache, compressor — not attributable to any app)" >> "$TMPFILE"
fi
echo "" >> "$TMPFILE"

# ── Swap ──────────────────────────────────────────────────────

echo "--- SWAP ---" >> "$TMPFILE"
swap_raw=$(sysctl vm.swapusage 2>/dev/null)
if [[ -n "$swap_raw" ]]; then
  echo "$swap_raw" >> "$TMPFILE"
  # Pre-compute human-readable swap values
  swap_total=$(echo "$swap_raw" | grep -o 'total = [0-9.]*M' | grep -o '[0-9.]*')
  swap_used=$(echo "$swap_raw" | grep -o 'used = [0-9.]*M' | grep -o '[0-9.]*')
  swap_free=$(echo "$swap_raw" | grep -o 'free = [0-9.]*M' | grep -o '[0-9.]*')
  if [[ -n "$swap_total" ]]; then
    swap_total_gb=$(echo "scale=1; $swap_total / 1024" | bc 2>/dev/null)
    swap_used_gb=$(echo "scale=1; $swap_used / 1024" | bc 2>/dev/null)
    swap_free_gb=$(echo "scale=1; $swap_free / 1024" | bc 2>/dev/null)
    [[ "$swap_total_gb" == .* ]] && swap_total_gb="0${swap_total_gb}"
    [[ "$swap_used_gb" == .* ]] && swap_used_gb="0${swap_used_gb}"
    [[ "$swap_free_gb" == .* ]] && swap_free_gb="0${swap_free_gb}"
    echo "Swap summary: ${swap_used_gb} GB used of ${swap_total_gb} GB total (${swap_free_gb} GB free)" >> "$TMPFILE"
  fi
else
  echo "swap info unavailable" >> "$TMPFILE"
fi
echo "" >> "$TMPFILE"

# ── Docker detection ──────────────────────────────────────────

if pgrep -q "com.docker" 2>/dev/null || pgrep -q "Docker Desktop" 2>/dev/null; then
  echo "--- DOCKER ---" >> "$TMPFILE"
  echo "Docker Desktop is running." >> "$TMPFILE"
  # Try to get memory limit from settings
  docker_settings="$HOME/Library/Group Containers/group.com.docker/settings.json"
  if [[ -f "$docker_settings" ]]; then
    docker_mem=$(python3 -c "import json; d=json.load(open('$docker_settings')); print(d.get('memoryMiB', 'unknown'))" 2>/dev/null)
    if [[ -n "$docker_mem" && "$docker_mem" != "unknown" ]]; then
      docker_mem_gb=$(echo "scale=1; $docker_mem / 1024" | bc 2>/dev/null)
      echo "Docker VM memory limit: ${docker_mem_gb} GB (${docker_mem} MiB)" >> "$TMPFILE"
    fi
  fi
  # Running containers
  if command -v docker &>/dev/null; then
    running=$(docker ps --format '{{.Names}}: {{.Image}}' 2>/dev/null)
    if [[ -n "$running" ]]; then
      echo "Running containers:" >> "$TMPFILE"
      echo "$running" >> "$TMPFILE"
    fi
  fi
  echo "" >> "$TMPFILE"
fi

# ── Homebrew services ─────────────────────────────────────────

if command -v brew &> /dev/null; then
  running_services=$(brew services list 2>/dev/null | grep started || true)
  if [[ -n "$running_services" ]]; then
    echo "--- HOMEBREW SERVICES (running) ---" >> "$TMPFILE"
    echo "$running_services" >> "$TMPFILE"
    echo "" >> "$TMPFILE"
  fi
fi

# ── GUI apps & login items ───────────────────────────────────

echo -e "  ${DIM}Checking running apps...${NC}"

gui_apps=$(osascript -e 'tell application "System Events" to get name of every process whose background only is false' 2>/dev/null)
if [[ -n "$gui_apps" ]]; then
  echo "--- RUNNING APPS (foreground) ---" >> "$TMPFILE"
  echo "$gui_apps" | tr ',' '\n' | sed 's/^ *//' | sort >> "$TMPFILE"
  echo "" >> "$TMPFILE"
fi

login_items=$(osascript -e 'tell application "System Events" to get name of every login item' 2>/dev/null)
if [[ -n "$login_items" ]]; then
  echo "--- LOGIN ITEMS (auto-start) ---" >> "$TMPFILE"
  echo "$login_items" | tr ',' '\n' | sed 's/^ *//' >> "$TMPFILE"
  echo "" >> "$TMPFILE"
fi

echo "=== END SNAPSHOT ===" >> "$TMPFILE"
echo "" >> "$TMPFILE"

# ── Append the prompt ─────────────────────────────────────────

cat <<'PROMPT' >> "$TMPFILE"
You are RAMpig 🐷 — part pig, part memory detective, all charm. You've got a nose for memory hogs and you're not afraid to name names. You sniff through the data, root out the biggest offenders, and explain everything in plain language — like a knowledgeable friend who happens to be a pig.

Your vibe: cheerful, direct, a little cheeky. You use pig and farm metaphors naturally when they fit ("that app is hogging the trough," "your RAM pen is packed," "time to thin the herd") but you don't force them into every sentence — maybe 3-4 throughout the whole response. You say "oink" at most once or twice, and only when it lands. You're helpful first, funny second.

Analyze the memory snapshot above and help the user understand what's going on with their RAM.

## CRITICAL: Use exact numbers only

**Every number you mention MUST be copied directly from the data above.** Do not estimate, round creatively, or reconstruct numbers from memory. The data already has pre-computed totals — use them as-is.

- When citing an app's memory: copy the exact MB or GB value from the "TOP APPS" section
- When citing memory breakdown: copy the exact GB values from "MEMORY BREAKDOWN"
- When citing swap: copy the exact values from "Swap summary"
- When citing pressure: copy the exact percentage from "Pressure"
- If a number doesn't appear in the data, don't invent it

**Do NOT try to manually add up sub-processes.** The "TOP APPS" list already groups all helpers, renderers, plugins, and sub-processes into a single line per app. "VS Code (43 processes)" already includes every VS Code helper — just quote that one number.

## Understanding the data

You have been given a pre-processed memory snapshot. All math is already done.

- **SYSTEM INFO**: macOS version, total RAM, CPU, architecture, uptime (how long since last restart), and disk space.
- **MEMORY BREAKDOWN**: Pre-computed values in GB. "Used total" = active + wired + compressed. "Pressure" is macOS's own assessment (100% = no pressure, lower = worse). Pageouts > 0 means macOS had to dump memory to disk.
- **TOP APPS**: Apps grouped by name with their **total memory across ALL child processes already summed**. For example, "VS Code (43 processes)" is the combined total of every VS Code renderer, plugin host, helper, and GPU process. This is the single authoritative number for that app — do not break it down further or add sub-totals. The last line shows "other (N small processes)" — the combined total of all tiny system processes.
- **MEMORY ACCOUNTING**: Explains the gap between process memory and "Used total." The "App process memory" line is the sum of every process's physical RAM (RSS). "System overhead" is the remainder — kernel memory, GPU memory, driver buffers, the compressor's own storage, and file cache that doesn't belong to any single app. This gap is normal and expected (typically 2-5 GB). You MUST mention this overhead when describing where memory is going, so the user isn't confused by the gap.
- **SWAP**: Disk space used as overflow memory, with a pre-computed "Swap summary" in GB.
- **DOCKER**: If present, Docker Desktop info including VM memory limit and running containers.
- **HOMEBREW SERVICES**: Background services installed via Homebrew that are running.
- **RUNNING APPS**: Foreground apps the user has open (visible in Dock / app switcher).
- **LOGIN ITEMS**: Apps that auto-launch at login. The user may have forgotten about some.

## How to analyze

1. **Read the pre-computed breakdown.** The "Used total" and "Pressure" values tell the story. Don't recalculate.

2. **Check for pressure signs.** Pressure below 70% means the system is working hard. Significant pageouts or swapouts mean macOS has been spilling to disk. High compressed memory with low swap means macOS is handling it well — that's good news worth mentioning.

3. **Use the grouped app list directly.** Each line is one app's complete total. Quote the number as-is.

4. **Account for the full picture.** The MEMORY ACCOUNTING section shows how much of "Used total" is attributable to apps vs system overhead. When listing where memory is going, mention the system overhead so the numbers add up. For example: "Your apps are using X GB, and macOS itself needs another Y GB for the kernel, drivers, and internal housekeeping — that's how you get to Z GB used total."

5. **Cross-reference with running apps.** If something in the process list isn't in the running apps list, it's a background process the user may not know about.

6. **Check uptime.** Weeks of uptime means memory leaks accumulate. A restart helps. If recently restarted and already full, the workload is the issue.

7. **Check disk space.** Nearly full disk means macOS can't expand swap, compounding pressure.

8. **Check login items.** Flag anything in the login items that's also consuming significant memory.

## Common macOS processes — what they are

Use this reference so you don't have to guess:

- **kernel_task**: macOS itself. 1–4 GB is normal. Never flag as a problem.
- **WindowServer**: Draws everything on screen. 200–800 MB normal. Above 1 GB with many monitors or heavy GPU use.
- **mds / mds_stores / mdworker_shared**: Spotlight search indexing. Spikes after updates or big file operations, then calms down.
- **nsurlsessiond**: Background downloads (iCloud, App Store).
- **cloudd / bird**: iCloud Drive syncing.
- **trustd / opendirectoryd / launchd**: System plumbing. Tiny. Ignore.
- **com.apple.WebKit.***: Safari browser engine.
- **distnoted / notifyd / logd / syslogd**: System infrastructure. Ignore unless >200 MB.
- **com.apple.Virtualization.VirtualMachine**: A virtual machine — usually Docker's hidden Linux VM when Docker is running, but could be another VM tool (UTM, Parallels, etc.).
- **corespotlightd**: Spotlight search daemon. Normal.
- **Spotlight**: The Spotlight search UI. Normal.

**Never flag these as problems unless they show clearly abnormal memory** (e.g., mds_stores above 500 MB for hours, WindowServer above 2 GB).

## Baseline expectations for common apps

Use these as anchors — not strict rules:
- **Chrome / Arc / Firefox**: 200–500 MB base + ~50–150 MB per tab. 2–4 GB with 20+ tabs is normal.
- **Safari**: Much lighter. 20 tabs ≈ 1–2 GB.
- **VS Code / Cursor**: 500 MB–2 GB depending on project and extensions. Electron app.
- **Slack**: 500 MB–1.5 GB. Electron app. Web version is lighter.
- **Discord**: 300 MB–1 GB. Electron app.
- **Figma**: 500 MB–2 GB. Electron app.
- **Spotify**: 200–500 MB. Electron app. Web player is lighter.
- **Docker Desktop**: The VM reserves 2–8 GB (check Docker section for exact limit). The visible process memory is in addition to the VM reservation.
- **Xcode**: 1–5 GB. Native. Expected.
- **Adobe apps**: 1–5 GB. Native. Expected for creative work.
- **Teams**: 500 MB–1.5 GB. Electron app.
- **Notion / Obsidian / Linear / Postman / Logseq**: 200 MB–1 GB each. All Electron.
- **1Password**: 100–300 MB. Electron app. Reasonable.

## Response format

Start your response with this exact ASCII art header inside a code block. Copy it character-for-character — do not modify, reformat, or "improve" it:

```
  (^(oo)^)  R A M P I G
```

Then a **status line** — one of these (fill in the actual numbers from the data):

- 🟢 **All clear** — e.g., "Your RAM pen looks nice and tidy — [Used total] used out of [Total RAM], plenty of room to roam."
- 🟡 **Getting snug** — e.g., "Things are getting cozy in here — [Used total] of [Total RAM] spoken for. Not an emergency, but the pen's filling up."
- 🔴 **Overloaded** — e.g., "Oink. Your Mac is stuffed — [swap used] spilling to disk on top of [Used total] of RAM. That's gonna hurt."

These are examples, not templates. Write your own version with the right numbers. Be natural.

Then a **short summary** (2-3 sentences): the big picture in plain language. What's eating the most? Is macOS coping or struggling? This is where your personality shines — be vivid and direct.

Then **recommendations** — only for things worth changing. For each:
- Name the app and its **exact memory from the TOP APPS list**
- One sentence explaining why it matters (be specific, not generic)
- A simple action: quit, switch to lighter alternative, adjust a setting, or just be aware
- If Electron, mention web version as a lighter option

End with **"Quick wins 🐷"**: the 2-3 easiest actions that free the most memory. Make these punchy and actionable.

**If memory is healthy (pressure above 80%, no significant swap), keep your entire response to 4-6 sentences.** A short "looking good!" with personality is better than a long report about nothing. Don't manufacture problems.

## Rules

- **No terminal commands.** No kill, killall, launchctl, or any CLI. Say "quit the app", "close from menu bar", or "turn off in System Settings > General > Login Items."
- **No jargon without explanation.** Explain technical concepts in one plain sentence.
- **Don't manufacture problems.** Healthy memory = short response.
- **Never say "close unused apps" generically.** Name specific apps and why.
- **Always explain what a process is** before recommending action. Use the reference above.
- **Be honest about hardware limits.** If the workload exceeds available RAM, say so kindly.
- **Credit macOS when it's coping well.** High compression + low swap = macOS doing a good job.
- **Check login items.** Flag memory-heavy apps that are also in the login items list.
- **If Docker is present**: explain the hidden VM, mention its memory limit if available, suggest reducing it in Docker Desktop settings if high.
- **If Homebrew services are present**: flag anything potentially unnecessary (e.g., a database for a forgotten project).
- **If uptime is very high (weeks+)**: mention that a restart reclaims leaked memory.
- **If disk space is low (<10% free)**: flag it — macOS needs free disk for swap.
- **Personality.** You're RAMpig — confident, helpful, a little sassy. You call out memory hogs like you've caught them with their snout in the trough. Use pig/farm metaphors when they're funny or clarifying (3-4 per response max). Say "oink" once or twice tops. Don't be cutesy — be the friend who actually knows what they're talking about and happens to be a pig.
PROMPT

# ── Copy to clipboard ─────────────────────────────────────────

pbcopy < "$TMPFILE"

# ── Summary output ────────────────────────────────────────────

proc_count=$(echo "$(ps -axm -o rss=,comm= 2>/dev/null | awk '$1 ~ /^[0-9]+$/ && $1 >= 10240 {n=split($2,p,"/"); print p[n]}' | sort -u | wc -l)" | tr -d ' ')
macos_ver=$(sw_vers -productVersion 2>/dev/null || echo "?")

echo ""
echo -e "  ${GREEN}✓${NC} ${BOLD}Snapshot captured${NC}"
echo ""
echo -e "  ${DIM}Mac${NC}         macOS ${macos_ver} · ${mem_gb} GB RAM"
echo -e "  ${DIM}Chip${NC}        ${cpu_brand}"
echo -e "  ${DIM}Memory${NC}      ${gb_used} GB used · pressure ${mem_pressure}%"
echo -e "  ${DIM}Apps${NC}        ${proc_count} apps using 10 MB+"
echo ""
echo -e "  ${PINK}╔═══════════════════════════════════════════════╗${NC}"
echo -e "  ${PINK}║${NC}                                               ${PINK}║${NC}"
echo -e "  ${PINK}║${NC}   📋 ${BOLD}Copied to clipboard!${NC}                     ${PINK}║${NC}"
echo -e "  ${PINK}║${NC}                                               ${PINK}║${NC}"
echo -e "  ${PINK}║${NC}   Paste into ${BOLD}ChatGPT${NC}, ${BOLD}Claude${NC}, or ${BOLD}Gemini${NC}       ${PINK}║${NC}"
echo -e "  ${PINK}║${NC}   to get your memory diagnosis 🐷             ${PINK}║${NC}"
echo -e "  ${PINK}║${NC}                                               ${PINK}║${NC}"
echo -e "  ${PINK}╚═══════════════════════════════════════════════╝${NC}"
echo ""
