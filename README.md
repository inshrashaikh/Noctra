# Noctra — Night-Time Decision Engine

> **"It's 2:30 AM. Your shift just ended. How do you get home safely?"**

Noctra is a night-time decision engine for night-shift workers in Nagpur. It shows feasible travel plans, deadline slack under best/expected/worst case, route risk evidence, essential services, and labels every fact as KNOWN, PROBABLE, OUTDATED, or UNKNOWN.

Built for **CASCADE '26 at IIIT Nagpur** — Problem 1.1: "The City That Sleeps While You Work."

---

## 📱 Android App & Mobile Experience

Noctra is packaged as a high-performance native Android application using Capacitor with full hardware acceleration, offline caching, and responsive edge-to-edge support.

### Key Mobile Features
- **Scenario-Based "Get Started" Walkthrough**: Auto-launches for first-time night-shift workers with transparent cartoon illustrations adapting seamlessly across Light & Dark themes.
- **Contingency Engine**: Worst-case buffer calculation and strict "Decide-By" thresholds before the point of no return.
- **Verified Safe Havens & 1-Tap 112 SOS**: Quick access to 24×7 open hospital emergency wards, all-night pharmacies, and police booths.
- **Pixel-Perfect 1:1 Scale**: Locked viewport scaling and fixed 100% text zoom to ensure native look & feel without horizontal panning or web page zoom artifacts.

---

## 📲 How to Install the Android App

### Method 1: Direct ADB Installation (Fastest via USB Cable)

1. **Enable USB Debugging on your phone**:
   - Go to **Settings > About Phone** and tap **Build Number** 7 times to enable Developer Options.
   - In **Settings > Developer Options**, enable **USB Debugging** (and enable **"Install via USB"** if using a Xiaomi/Redmi/MIUI device).
2. **Connect phone to your PC via USB** and accept the USB debugging prompt on your phone screen.
3. **Verify ADB connection**:
   ```bash
   adb devices
   # Should list your device ID with 'device' status
   ```
4. **Install the APK directly**:
   ```bash
   adb install -r ./Noctra-debug.apk
   ```
5. **Launch Noctra**:
   ```bash
   adb shell am start -n in.noctra.app/.MainActivity
   ```

---

### Method 2: Manual APK Installation on Any Android Phone

1. Copy `Noctra-debug.apk` to your phone (via USB File Transfer, Google Drive, WhatsApp, or Bluetooth).
2. On your phone, open your **Files / File Manager** app and tap `Noctra-debug.apk`.
3. If prompted by Android, grant permission to **"Install unknown apps"** for your file manager.
4. Tap **Install** and open **Noctra** from your phone's app drawer.

---

### Method 3: Building APK from Source

To compile the latest web code into an updated Android APK:

```bash
# 1. Build the web production bundle
pnpm --filter @noctra/web build

# 2. Sync web assets to Capacitor Android
pnpm --filter @noctra/web cap:sync

# 3. Compile debug APK using Gradle
cd apps/web/android
./gradlew assembleDebug
cd ../../..

# 4. Copy output APK to root
cp apps/web/android/app/build/outputs/apk/debug/app-debug.apk ./Noctra-debug.apk

# 5. Install to connected device
adb install -r ./Noctra-debug.apk
```

---

## 💻 Web App Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+
pnpm install
pnpm dev          # Start dev server at http://localhost:5173
```

### Demo Mode

Visit `http://localhost:5173/planner?demo=1` to see the interactive demo panel with scenario controls.

### Key URLs

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/planner` | Planner dashboard |
| `/planner?demo=1` | Dashboard with demo controls |
| `/about` | About & data provenance |

---

## Project Structure

```
noctra/
  apps/web/          → React frontend (Vite + TypeScript) + Capacitor Android project
  apps/api/          → Python backend stub (FastAPI placeholder)
  packages/contracts/ → Shared zod schemas & TypeScript types
  packages/config/   → Shared config presets
  data/              → Data manifests and graph placeholders
  docs/              → Architecture, design system, decisions
  scripts/           → Dev and CI helper scripts
```

## Stack

- **Frontend:** React 18, TypeScript strict, Vite, Tailwind CSS v4, shadcn/ui
- **Mobile Packaging:** Capacitor 7 Android
- **Routing:** TanStack Router + TanStack Query
- **State:** Zustand (persisted stores for theme, onboarding & user settings)
- **Map:** MapLibre GL JS via react-map-gl
- **Mocking:** MSW (browser worker)
- **Tests:** Vitest + Testing Library + Playwright

## Data Modes

Set `VITE_DATA_MODE` in `.env`:
- `mock` — MSW intercepts API calls with simulated fixtures (default)
- `api` — Calls real backend at `VITE_API_BASE_URL`

## Honesty Principles

1. Mock data is never presented as live — every simulated data point shows a **SIMULATED** badge.
2. Risk scores are labeled **"Environmental risk proxy (not crime data)"**.
3. No invented transport timings, opening hours, or safety statistics.
4. Evidence labels degrade over time: KNOWN → PROBABLE → OUTDATED → UNKNOWN.

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end tests
pnpm check        # All checks: typecheck + lint + test + build
```

## License

Built for CASCADE '26. Map data © OpenStreetMap contributors.
