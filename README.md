# VSCode Glassmorphism: Mindful Workspace

Transform your high-density VS Code into an ultra-minimalist, soothing, and stress-reducing workspace featuring the **Glassmorphism Night & Day** themes, **Glassmorphism Minimal Icons**, offline procedural ambient soundscapes, Pomodoro focus ring, and micro-habits.

---

## 🚀 Quick Start & Activation Guide

### 1. Activating Color Themes
Press `Cmd + K, Cmd + T` (Windows/Linux: `Ctrl + K, Ctrl + T`) or open `Cmd + Shift + P` -> **Preferences: Color Theme**:
- 🌙 **`Glassmorphism Night`**: Deep Obsidian black canvas (`#0B0D13`) designed for night-time and low-light environments.
- ☀️ **`Glassmorphism Day`**: Warm Washi mist paper canvas (`#FAFBFC` / `#F5F6F8`) designed for bright daylight and anti-glare coding.

#### 💡 Automatic Day & Night Switching (Recommended)
Sync seamlessly with your macOS / Windows light and dark appearance by adding these lines to your VS Code `settings.json` (`Cmd + Shift + P` -> `Preferences: Open User Settings (JSON)`):
```json
"workbench.preferredDarkColorTheme": "Glassmorphism Night",
"workbench.preferredLightColorTheme": "Glassmorphism Day",
"window.autoDetectColorScheme": true
```

---

### 2. Activating File Icons
Press `Cmd + Shift + P` -> **Preferences: File Icon Theme** (or `Cmd + K, Cmd + T` -> *File Icon Theme*):
- 🎨 Select **`Glassmorphism Minimal Icons`** to apply the unified pastel line-art icon theme across all your project files.

---

### 3. Opening the Mindful Workspace
- **Activity Bar (Sidebar)**: Click the Zen Ring icon in the primary activity bar on the far left.
- **Status Bar**: Click the `$(sparkle) Chill` item in the bottom right corner of the window.
- **Editor Tab (Side-by-Side)**: Press `Cmd + Shift + P` -> **`Glassmorphism: Open Mindful Workspace in Editor Tab`** to pin the interface alongside your code.

---

## 🌿 Core Features

### 1. Zen Ultra-Minimalist Interface (Dieter Rams "Less, but better")
- **Borderless Fluid Canvas**:
  - Eliminates heavy box containers and borders. The entire interface dissolves seamlessly into the canvas of VS Code.
  - Automatically adapts its colors between Obsidian Night and Warm Paper Day based on your active theme.
- **Tap-to-Toggle Focus Ring**:
  - Interactive SVG circular timer: click or tap the ring directly to **Start / Pause / Resume**.
  - Visual breathing glow filter during active countdown sessions.
  - Quick mode switcher: **Focus (25m)**, **Rest (5m)**, and **Deep Rest (15m)**.
  - Ghost reset button for one-click restarts.
  - Live synchronization with the VS Code Status Bar item (`$(sparkle) Chill` / countdown).
- **Procedural Ambient Soundscapes (100% Offline Web Audio API)**:
  - **🌧️ Rain**: Filtered pink/brown noise simulating gentle rainfall and mist.
  - **🎧 Lofi Chords**: Warm analog polyphonic chords with subtle tape drift and lowpass filter sweeps.
  - **🌬️ Air Mask**: Calming white noise that masks high-frequency office noise and background chatter.
  - **Auto-Revealing Hairline Volume**: Ultra-thin volume slider that appears only when audio is active.
  - **Smart Mute Pill**: Dedicated quick-stop pill `[ ✕ ]` visible while sound is playing.
  - Zero external MP3/audio assets required — synthesizes pure audio in real-time.
- **One-Touch Micro-Habit Tracker**:
  - Single-tap action pills that record daily micro-breaks:
    - `💧 Water` (Hydration goal)
    - `🧘 Stretch` (Posture renewal)
    - `🌬️ Breathe` (Mindful respiration with guided 4-7-8 breathing orb)
  - Color-shifting success states upon reaching daily targets.
  - Hairline gradient **Zen Meter** showing real-time daily mindfulness balance (0% - 100%).
  - Automatic midnight rollover and persistent state across window reloads.

---

### 2. Glassmorphism Night Color Theme
- **Deep Obsidian Canvas (`#0B0D13`)**: Eliminates eye strain and visual fatigue.
- **Muted Slate Typography (`#525F78`)**: Inactive UI elements and comments softly recede into the background.
- **Full Semantic Token Hierarchy**:
  - **Keywords / Control Flow**: Pale Lavender (`#B8B8D1`)
  - **Functions / Methods / Hooks / Macros**: Soft Periwinkle Cyan (`#98B7C7`)
  - **Types / Structs / Classes / Primitives**: Soft Lilac (`#C5B4E3`)
  - **Properties / Object Keys / Fields**: Warm Sand Amber (`#E5C07B`)
  - **Parameters**: Soft Slate Ice (`#A3B8CC`)
  - **Numbers / Booleans / Constants**: Pastel Terracotta (`#D3A588`)
  - **Strings**: Calming Sage Green (`#87AF87`)
- **Built-in YAML & TOML Syntax Support**:
  - Out-of-the-box syntax coloring for `Cargo.toml`, `pyproject.toml`, `*.yaml`, `*.yml`, and config files without requiring external plugins.
  - Table headers in Soft Lilac / Deep Iris (`[package]`, `[dependencies]`).
  - Mapping keys in Pale Lavender / Slate Lavender (`support.type.property-name`).
  - Strings in Sage Green / Forest Herb (`#87AF87` / `#376D4B`).
  - Numbers and Booleans in Pastel Terracotta (`#D3A588` / `#B25028`).
- **Borderless Workbench**: Removes harsh borders across the activity bar, sidebars, editor groups, and status bar.

---

### 3. Glassmorphism Day Color Theme (Light Mode)
- **Warm Mist Paper Canvas (`#FAFBFC` / `#F5F6F8`)**: Soft alabaster/washi paper surface eliminating harsh glare in bright daylight environments.
- **Slate Charcoal Typography (`#2B3342`)**: Deep ink contrast (WCAG AAA compliant) that avoids eye fatigue.
- **Natural Botanical Accents**:
  - **Forest Herb (`#376D4B`)**: Strings, progress indicators, and active accents.
  - **Deep Lavender (`#635885`)**: Keywords, storage modifiers, and badges.
  - **Ocean Slate Cyan (`#286A84`)**: Functions, methods, and React hooks.
  - **Deep Iris (`#744DA3`)**: Types, structs, classes, and primitives.
  - **Warm Amber Bark (`#9A6218`)**: Properties, fields, and object keys.
  - **Terracotta Brick (`#B25028`)**: Numbers, booleans, and language constants.

---

### 4. Glassmorphism Minimal Icons Theme
Custom line-art pastel file and folder icons for popular programming languages and configurations:
- **Frontend & Frameworks**: Vue.js (`.vue`), Angular / AngularJS (`angular.json`, `.component.ts`, `.component.html`, `.component.scss`, `.directive.ts`), TypeScript, JavaScript, HTML, CSS/SCSS
- **iOS & Apple Configuration**: Storyboard (`.storyboard`, `.xib`), Security & Entitlements (`.entitlements`), Apple Privacy Manifest (`.xcprivacy` / `PrivacyInfo.xcprivacy`), Swift (`.swift`)
- **Android & Gradle Build**: Gradle (`.gradle`, `.gradle.kts`, `gradlew`, `gradlew.bat`), Android Manifest (`AndroidManifest.xml`), Android Packages (`.apk`, `.aab`), Kotlin (`.kt`, `.kts`), Java (`.java`, `.jar`)
- **Systems & Native**: Rust (`.rs`, `Cargo.toml`), Go (`.go`, `go.mod`), C/C++ (`.c`, `.cpp`, `.h`, `.hpp`)
- **Cross-Platform & Mobile**: Dart (`.dart`), Flutter (`pubspec.yaml`), CocoaPods (`Podfile`, `Podfile.lock`)
- **Scripting & Backend**: Python (`.py`, `.ipynb`, `Pipfile`), Ruby (`.rb`, `Gemfile`, `Rakefile`), PHP (`.php`), Shell (`.sh`, `.zsh`, `Makefile`)
- **DevOps & Config**: Docker (`Dockerfile`, `docker-compose.yml`), YAML/YML, SQL/Databases, Env files (`.env`), Markdown, Git, Packages/Archives.

---

## ⌨️ Commands

All commands are curated under the **`Glassmorphism`** category for zero conflict with other extensions:

| Command | Shortcut / Palette | Action |
|---|---|---|
| `Glassmorphism: Open Mindful Workspace in Editor Tab` | `Cmd + Shift + P` | Open the mindful interface side-by-side in an editor tab |
| `Glassmorphism: Start / Pause Focus Timer (⏱️)` | `Cmd + Shift + P` | Toggle the active Pomodoro focus countdown |
| `Glassmorphism: Stop All Ambient Audio (🔇)` | `Cmd + Shift + P` | Immediately mute and suspend all procedural audio nodes |

---

## ⚙️ Configuration Settings

Customize your mindful workspace in VS Code Settings (`Cmd + ,` -> Search `Glassmorphism`):

| Setting | Default | Description |
|---|---|---|
| `vscode-glassmorphism.pomodoroDurationMinutes` | `25` | Duration of focus Pomodoro session (minutes). |
| `vscode-glassmorphism.shortBreakMinutes` | `5` | Duration of short rest break (minutes). |
| `vscode-glassmorphism.longBreakMinutes` | `15` | Duration of long rest break (minutes). |
| `vscode-glassmorphism.waterGoal` | `8` | Daily water glasses target. |
| `vscode-glassmorphism.stretchGoal` | `4` | Daily stretch breaks target. |
| `vscode-glassmorphism.breatheGoal` | `3` | Daily deep breathing sessions target. |
| `vscode-glassmorphism.soundNotifications` | `true` | Play gentle audio chime on session completion. |

---

## 📁 Architectural Layout

```
vscode-glassmorphism/
├── package.json                              # Extension manifest & configuration contributes
├── tsconfig.json                             # TypeScript compiler configuration
├── .vscodeignore                             # Packaging whitelist
├── .gitignore                                # Git ignore rules
├── media/
│   ├── chill-icon.svg                        # Vector Zen sidebar & activity bar icon
│   └── icon.png                              # 128x128 extension marketplace icon
├── themes/
│   ├── glassmorphism-night-color-theme.json  # Glassmorphism Night obsidian dark theme
│   └── glassmorphism-day-color-theme.json    # Glassmorphism Day warm washi light theme
├── icons/
│   ├── glassmorphism-icon-theme.json         # Glassmorphism Minimal Icons theme definition
│   └── *.svg                                 # Pastel line-art language & file icons (31 icons)
├── src/
│   ├── types.ts                              # Strict TypeScript state & messaging protocol
│   ├── ChillViewProvider.ts                  # Zen Ultra-Minimalist Webview & Procedural Audio Synthesizer
│   └── extension.ts                          # Extension lifecycle, commands & status bar sync
└── dist/                                     # Compiled JavaScript distribution bundle
```

---

## 🔒 Security & Privacy

- **Strict Content Security Policy (CSP)**:
  - `default-src 'none'`
  - `script-src 'nonce-${nonce}'`
  - `style-src ${webview.cspSource} 'unsafe-inline'`
  - `img-src ${webview.cspSource} data:`
- **100% Offline & Private**: Zero external network calls, zero analytics or telemetry tracking.
- **Resource Sandboxing**: Webview resource roots are locked strictly to the extension directory (`[context.extensionUri]`).

---

## 🛠️ Build & Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for extension development
npm run watch

# Package extension VSIX
npx @vscode/vsce package --no-dependencies
```

---

## 📄 License

MIT © [waldoxbin](https://github.com/codechill/vscode-glassmorphism.git)
