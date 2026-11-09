import * as vscode from 'vscode';
import {
  ChillAppState,
  ExtensionToWebviewMessage,
  PomodoroMode,
  WebviewToExtensionMessage
} from './types';

export class ChillViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'vscode-glassmorphism.chillView';

  private view?: vscode.WebviewView;
  private editorPanel?: vscode.WebviewPanel;
  private onHabitLoggedCallback?: (habit: 'water' | 'stretch' | 'breathe', count: number, goal: number) => void;
  private onTimerStateCallback?: (isRunning: boolean, mode: PomodoroMode, remainingSeconds: number) => void;
  private onTimerCompletedCallback?: (mode: PomodoroMode) => void;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly globalState: vscode.Memento
  ) {}

  public onHabitLogged(cb: (habit: 'water' | 'stretch' | 'breathe', count: number, goal: number) => void): void {
    this.onHabitLoggedCallback = cb;
  }

  public onTimerState(cb: (isRunning: boolean, mode: PomodoroMode, remainingSeconds: number) => void): void {
    this.onTimerStateCallback = cb;
  }

  public onTimerCompleted(cb: (mode: PomodoroMode) => void): void {
    this.onTimerCompletedCallback = cb;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
    this.attachMessageHandlers(webviewView.webview);
  }

  public openInEditorPanel(): void {
    if (this.editorPanel) {
      this.editorPanel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    this.editorPanel = vscode.window.createWebviewPanel(
      'vscode-glassmorphism.editorPanel',
      'Glassmorphism: Mindful Workspace',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.extensionUri]
      }
    );

    this.editorPanel.webview.html = this.getHtmlForWebview(this.editorPanel.webview);
    this.attachMessageHandlers(this.editorPanel.webview);

    this.editorPanel.onDidDispose(() => {
      this.editorPanel = undefined;
    });
  }

  private attachMessageHandlers(webview: vscode.Webview): void {
    webview.onDidReceiveMessage(async (message: WebviewToExtensionMessage) => {
      switch (message.type) {
        case 'READY': {
          const savedState = this.globalState.get<ChillAppState>('vscode_glassmorphism_state');
          this.postMessage({
            type: 'INIT_STATE',
            state: savedState
          });
          break;
        }

        case 'STATE_SAVE': {
          await this.globalState.update('vscode_glassmorphism_state', message.state);
          break;
        }

        case 'HABIT_LOGGED': {
          if (this.onHabitLoggedCallback) {
            this.onHabitLoggedCallback(message.habit, message.count, message.goal);
          }
          break;
        }

        case 'TIMER_STATE_CHANGED': {
          if (this.onTimerStateCallback) {
            this.onTimerStateCallback(message.isRunning, message.mode, message.remainingSeconds);
          }
          break;
        }

        case 'TIMER_COMPLETED': {
          if (this.onTimerCompletedCallback) {
            this.onTimerCompletedCallback(message.mode);
          }
          break;
        }

        case 'STOP_ALL_AUDIO': {
          this.postMessage({ type: 'STOP_ALL_AUDIO' });
          break;
        }

        case 'SHOW_NOTIFICATION': {
          vscode.window.showInformationMessage(message.message);
          break;
        }
      }
    });
  }

  public postMessage(message: ExtensionToWebviewMessage): void {
    if (this.view) {
      this.view.webview.postMessage(message);
    }
    if (this.editorPanel) {
      this.editorPanel.webview.postMessage(message);
    }
  }

  public stopAllAudio(): void {
    this.postMessage({ type: 'STOP_ALL_AUDIO' });
  }

  public triggerExternalAction(action: 'drinkWater' | 'stretch' | 'deepBreathe' | 'toggleTimer' | 'resetHabits'): void {
    this.postMessage({
      type: 'TRIGGER_ACTION',
      action
    });
  }

  public notifyConfigUpdate(): void {
    const config = vscode.workspace.getConfiguration('vscode-glassmorphism');
    this.postMessage({
      type: 'CONFIG_UPDATED',
      config: {
        pomodoroMin: config.get<number>('pomodoroDurationMinutes', 25),
        shortBreakMin: config.get<number>('shortBreakMinutes', 5),
        longBreakMin: config.get<number>('longBreakMinutes', 15),
        waterGoal: config.get<number>('waterGoal', 8),
        stretchGoal: config.get<number>('stretchGoal', 4),
        breatheGoal: config.get<number>('breatheGoal', 3),
        soundEnabled: config.get<boolean>('soundNotifications', true)
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = this.generateNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src ${webview.cspSource} data:;
    style-src ${webview.cspSource} 'unsafe-inline';
    font-src ${webview.cspSource};
    script-src 'nonce-${nonce}';
  " />
  <title>Glassmorphism Mindful Workspace</title>
  <style>
    :root {
      --color-obsidian: #0B0D13;
      --color-slate: #525F78;
      --color-slate-light: #6E7B95;
      --color-sage: #87AF87;
      --color-lavender: #B8B8D1;
      --color-periwinkle: #98B7C7;
      --color-soft-white: #E6EAF2;
      --color-timer-digits: #FFFFFF;
      --font-stack: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    }

    body.vscode-light {
      --color-obsidian: #FAFBFC;
      --color-slate: #788294;
      --color-slate-light: #5A6475;
      --color-sage: #376D4B;
      --color-lavender: #635885;
      --color-periwinkle: #286A84;
      --color-soft-white: #2B3342;
      --color-timer-digits: #2B3342;
    }

    body.vscode-light .ring-track {
      stroke: rgba(0, 0, 0, 0.06);
    }

    body.vscode-light .mode-tab:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--color-soft-white);
    }

    body.vscode-light .mode-tab.active {
      color: var(--color-lavender);
      background: rgba(99, 88, 133, 0.1);
      border-color: rgba(99, 88, 133, 0.25);
    }

    body.vscode-light .sound-pill {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.08);
      color: var(--color-slate-light);
    }

    body.vscode-light .sound-pill:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--color-soft-white);
    }

    body.vscode-light .sound-pill.active {
      background: rgba(55, 109, 75, 0.12);
      border-color: var(--color-sage);
      color: var(--color-sage);
      box-shadow: 0 0 10px rgba(55, 109, 75, 0.15);
    }

    body.vscode-light .sound-pill.active.lofi {
      background: rgba(99, 88, 133, 0.12);
      border-color: var(--color-lavender);
      color: var(--color-lavender);
      box-shadow: 0 0 10px rgba(99, 88, 133, 0.15);
    }

    body.vscode-light .sound-pill.active.air {
      background: rgba(40, 106, 132, 0.12);
      border-color: var(--color-periwinkle);
      color: var(--color-periwinkle);
      box-shadow: 0 0 10px rgba(40, 106, 132, 0.15);
    }

    body.vscode-light .volume-bar {
      background: rgba(0, 0, 0, 0.08);
    }

    body.vscode-light .one-touch-habit {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.08);
      color: var(--color-soft-white);
    }

    body.vscode-light .one-touch-habit:hover {
      background: rgba(0, 0, 0, 0.06);
      border-color: rgba(0, 0, 0, 0.14);
    }

    body.vscode-light .one-touch-habit.goal-reached {
      border-color: rgba(55, 109, 75, 0.5);
      background: rgba(55, 109, 75, 0.1);
      color: var(--color-sage);
    }

    body.vscode-light .zen-meter-track {
      background: rgba(0, 0, 0, 0.06);
    }

    body.vscode-light .breath-modal {
      background: rgba(0, 0, 0, 0.02);
      border-color: rgba(99, 88, 133, 0.15);
    }

    body.vscode-light .btn-audio-mute-pill {
      border-color: rgba(0, 0, 0, 0.1);
      color: var(--color-slate);
    }

    body.vscode-light .btn-reset-ghost {
      color: var(--color-slate);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--vscode-editor-background, var(--color-obsidian));
      color: var(--color-soft-white);
      font-family: var(--font-stack);
      padding: 16px 12px 20px;
      overflow-x: hidden;
      overflow-y: auto;
      font-size: 11px;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
    }

    body::-webkit-scrollbar {
      width: 4px;
    }
    body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }

    .zen-layout {
      width: 100%;
      max-width: 290px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      position: relative;
    }

    /* 1. SEAMLESS ZEN TIMER */
    .timer-centerpiece {
      position: relative;
      width: 154px;
      height: 154px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .timer-centerpiece:hover {
      transform: scale(1.02);
    }

    .timer-centerpiece:active {
      transform: scale(0.98);
    }

    .svg-ring-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .svg-ring-wrapper svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.04);
      stroke-width: 4.5;
    }

    .ring-progress {
      fill: none;
      stroke: url(#zenGradient);
      stroke-width: 4.5;
      stroke-linecap: round;
      stroke-dasharray: 414.69; /* 2 * PI * 66 */
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .timer-centerpiece.running .ring-progress {
      filter: drop-shadow(0 0 6px rgba(135, 175, 135, 0.35));
    }

    .timer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      z-index: 2;
    }

    .timer-clock {
      font-size: 30px;
      font-weight: 500;
      letter-spacing: -0.5px;
      color: var(--color-timer-digits, #FFFFFF);
      font-variant-numeric: tabular-nums;
      line-height: 1;
      margin-bottom: 4px;
    }

    .timer-subtitle {
      font-size: 9px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--color-slate);
      transition: color 0.2s ease;
      font-weight: 500;
    }

    .timer-centerpiece.running .timer-subtitle {
      color: var(--color-sage);
    }

    /* Minimal Mode Switcher & Reset Row */
    .timer-controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 100%;
    }

    .mode-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-slate);
      font-size: 10px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .mode-tab:hover {
      color: var(--color-soft-white);
      background: rgba(255, 255, 255, 0.04);
    }

    .mode-tab.active {
      color: var(--color-lavender);
      background: rgba(184, 184, 209, 0.08);
      border-color: rgba(184, 184, 209, 0.2);
    }

    .btn-reset-ghost {
      background: transparent;
      border: none;
      color: var(--color-slate);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-left: 2px;
      opacity: 0.5;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .btn-reset-ghost:hover {
      opacity: 1;
      color: var(--color-soft-white);
      transform: rotate(-45deg);
    }

    /* 2. ULTRA-MINIMAL AMBIENT AUDIO PILLS */
    .audio-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .audio-pills-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
    }

    .sound-pill {
      flex: 1;
      max-width: 82px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      padding: 5px 8px;
      color: var(--color-slate-light);
      font-size: 10px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .sound-pill:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--color-soft-white);
    }

    .sound-pill.active {
      background: rgba(135, 175, 135, 0.12);
      border-color: var(--color-sage);
      color: var(--color-sage);
      box-shadow: 0 0 10px rgba(135, 175, 135, 0.18);
    }

    .sound-pill.active.lofi {
      background: rgba(184, 184, 209, 0.12);
      border-color: var(--color-lavender);
      color: var(--color-lavender);
      box-shadow: 0 0 10px rgba(184, 184, 209, 0.18);
    }

    .sound-pill.active.air {
      background: rgba(152, 183, 199, 0.12);
      border-color: var(--color-periwinkle);
      color: var(--color-periwinkle);
      box-shadow: 0 0 10px rgba(152, 183, 199, 0.18);
    }

    .btn-audio-mute-pill {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--color-slate);
      border-radius: 999px;
      width: 26px;
      height: 26px;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .btn-audio-mute-pill:hover {
      border-color: #D98880;
      color: #D98880;
      background: rgba(217, 136, 128, 0.1);
    }

    .btn-audio-mute-pill.visible {
      display: flex;
    }

    /* Auto-revealing hairline volume slider */
    .volume-reveal-box {
      width: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 8px;
      animation: fadeIn 0.25s ease;
    }

    .volume-reveal-box.show {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .volume-bar {
      flex: 1;
      -webkit-appearance: none;
      height: 3px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      outline: none;
      cursor: pointer;
    }

    .volume-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-lavender);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .volume-bar::-webkit-slider-thumb:hover {
      transform: scale(1.3);
    }

    .volume-percent {
      font-size: 9px;
      color: var(--color-slate);
      width: 24px;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    /* 3. ONE-TOUCH CHILL HABIT PILLS */
    .habits-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 9px;
    }

    .habit-pills-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      width: 100%;
    }

    .one-touch-habit {
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 7px 5px;
      color: var(--color-soft-white);
      font-size: 10px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      white-space: nowrap;
      user-select: none;
      min-width: 0;
    }

    .one-touch-habit:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }

    .one-touch-habit:active {
      transform: translateY(1px);
    }

    .one-touch-habit.goal-reached {
      border-color: rgba(135, 175, 135, 0.5);
      background: rgba(135, 175, 135, 0.08);
      color: var(--color-sage);
    }

    .habit-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      line-height: 1;
      margin-right: 3px;
      flex-shrink: 0;
    }

    .habit-icon.breath-icon {
      margin-right: 5px;
    }

    .habit-count {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .habit-target {
      color: var(--color-slate);
      font-weight: 400;
      font-size: 9px;
      margin-left: 1px;
    }

    /* Sleek hairline Zen progress line */
    .zen-meter-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .zen-meter-track {
      width: 100%;
      height: 3px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      overflow: hidden;
      position: relative;
    }

    .zen-meter-fill {
      height: 100%;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--color-sage) 0%, var(--color-lavender) 100%);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .zen-status-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: var(--color-slate);
      padding: 0 1px;
    }

    .reset-link {
      background: none;
      border: none;
      color: var(--color-slate);
      font-size: 8px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .reset-link:hover {
      opacity: 1;
      color: var(--color-lavender);
    }

    /* Guided Breathing Orb */
    .breath-modal {
      width: 100%;
      margin-top: 6px;
      padding: 12px 10px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(184, 184, 209, 0.12);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      animation: fadeIn 0.3s ease;
      cursor: pointer;
    }

    .breath-modal.show {
      display: flex;
    }

    .breath-orb-stage {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .breath-orb {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(135, 175, 135, 0.45) 0%, rgba(184, 184, 209, 0.1) 70%);
      border: 1.5px solid var(--color-sage);
      transition: transform 3.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease, box-shadow 0.8s ease;
      transform: scale(1);
    }

    .breath-orb.inhale {
      transform: scale(1.6);
      border-color: var(--color-lavender);
      box-shadow: 0 0 16px rgba(184, 184, 209, 0.35);
    }

    .breath-orb.exhale {
      transform: scale(0.85);
      border-color: var(--color-sage);
      box-shadow: 0 0 6px rgba(135, 175, 135, 0.2);
    }

    .breath-guide-caption {
      font-size: 10px;
      color: var(--color-lavender);
      letter-spacing: 0.4px;
      text-align: center;
      line-height: 1.2;
    }
  </style>
</head>
<body>

  <div class="zen-layout">

    <!-- 1. HERO ZEN TIMER (TAP RING TO TOGGLE) -->
    <div class="timer-centerpiece" id="timerRingToggle" title="Tap to Start / Pause Focus">
      <div class="svg-ring-wrapper">
        <svg viewBox="0 0 154 154">
          <defs>
            <linearGradient id="zenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--color-sage, #87AF87)" />
              <stop offset="100%" stop-color="var(--color-lavender, #B8B8D1)" />
            </linearGradient>
          </defs>
          <circle class="ring-track" cx="77" cy="77" r="66" />
          <circle class="ring-progress" id="timerProgressRing" cx="77" cy="77" r="66" />
        </svg>
      </div>

      <div class="timer-content">
        <div class="timer-clock" id="timerDigits">25:00</div>
        <div class="timer-subtitle" id="timerSubtext">Tap to focus</div>
      </div>
    </div>

    <!-- Mode Selector & Reset Row -->
    <div class="timer-controls-row">
      <button class="mode-tab active" id="btnModeFocus">25m</button>
      <button class="mode-tab" id="btnModeShort">5m</button>
      <button class="mode-tab" id="btnModeLong">15m</button>
      <button class="btn-reset-ghost" id="btnResetTimer" title="Reset Session">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>
    </div>

    <!-- 2. AMBIENT SOUNDSCAPES (PILL ROW) -->
    <div class="audio-section">
      <div class="audio-pills-row">
        <button class="sound-pill" id="nodeRain" title="Rainfall soundscape">
          <span>🌧️</span> Rain
        </button>
        <button class="sound-pill" id="nodeLofi" title="Lofi warm chords">
          <span>🎧</span> Lofi
        </button>
        <button class="sound-pill" id="nodeWhiteNoise" title="Soft air mask">
          <span>〰️</span> Air
        </button>
        <button class="btn-audio-mute-pill" id="btnMasterAudioToggle" title="Mute all audio">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Auto-revealed Volume Slider -->
      <div class="volume-reveal-box" id="volumeBox">
        <input type="range" class="volume-bar" id="masterVolumeRange" min="0" max="100" value="25" />
        <span class="volume-percent" id="volumeValueText">25%</span>
      </div>
    </div>

    <!-- 3. ONE-TOUCH CHILL HABITS -->
    <div class="habits-section">
      <div class="habit-pills-row">
        <button class="one-touch-habit" id="btnDrinkWater" title="Tap to drink water">
          <span class="habit-icon">💧</span>
          <span class="habit-count" id="valWater">0</span><span class="habit-target" id="goalWater">/8</span>
        </button>
        <button class="one-touch-habit" id="btnStretchBreak" title="Tap to log stretch">
          <span class="habit-icon">🧘</span>
          <span class="habit-count" id="valStretch">0</span><span class="habit-target" id="goalStretch">/4</span>
        </button>
        <button class="one-touch-habit" id="btnDeepBreathe" title="Tap for mindful breath">
          <span class="habit-icon breath-icon">🌬️</span>
          <span class="habit-count" id="valBreathe">0</span><span class="habit-target" id="goalBreathe">/3</span>
        </button>
      </div>

      <!-- Hairline Progress Line -->
      <div class="zen-meter-wrapper">
        <div class="zen-meter-track">
          <div class="zen-meter-fill" id="chillProgressFill"></div>
        </div>
        <div class="zen-status-caption">
          <span id="chillStatusQuote">Calm flow</span>
          <button class="reset-link" id="btnResetHabits">reset</button>
        </div>
      </div>

      <!-- Guided Breath Modal -->
      <div class="breath-modal" id="breathGuideBox" title="Tap to dismiss">
        <div class="breath-orb-stage">
          <div class="breath-orb" id="breathOrb"></div>
        </div>
        <div class="breath-guide-caption" id="breathHint">Inhale gently (4s)...</div>
      </div>
    </div>

  </div>

  <script nonce="${nonce}">
    (function () {
      const vscode = acquireVsCodeApi();

      // State store
      const state = {
        timer: {
          mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
          remainingSeconds: 25 * 60,
          totalSeconds: 25 * 60,
          isRunning: false
        },
        audio: {
          rain: false,
          lofi: false,
          whiteNoise: false,
          volume: 0.25
        },
        habits: {
          waterCount: 0,
          waterGoal: 8,
          stretchCount: 0,
          stretchGoal: 4,
          breatheCount: 0,
          breatheGoal: 3,
          lastUpdatedDate: new Date().toISOString().slice(0, 10)
        }
      };

      let timerInterval = null;
      const RING_CIRCUMFERENCE = 2 * Math.PI * 66; // 414.69

      // Web Audio Synthesizer
      let audioCtx = null;
      let rainSource = null;
      let rainGain = null;
      let whiteNoiseSource = null;
      let whiteNoiseGain = null;
      let lofiNodes = [];
      let masterGainNode = null;

      // DOM Elements
      const timerRingToggle = document.getElementById('timerRingToggle');
      const timerDigits = document.getElementById('timerDigits');
      const timerProgressRing = document.getElementById('timerProgressRing');
      const timerSubtext = document.getElementById('timerSubtext');
      const btnResetTimer = document.getElementById('btnResetTimer');
      const btnModeFocus = document.getElementById('btnModeFocus');
      const btnModeShort = document.getElementById('btnModeShort');
      const btnModeLong = document.getElementById('btnModeLong');

      const nodeRain = document.getElementById('nodeRain');
      const nodeLofi = document.getElementById('nodeLofi');
      const nodeWhiteNoise = document.getElementById('nodeWhiteNoise');
      const btnMasterAudioToggle = document.getElementById('btnMasterAudioToggle');
      const volumeBox = document.getElementById('volumeBox');
      const masterVolumeRange = document.getElementById('masterVolumeRange');
      const volumeValueText = document.getElementById('volumeValueText');

      const valWater = document.getElementById('valWater');
      const goalWater = document.getElementById('goalWater');
      const valStretch = document.getElementById('valStretch');
      const goalStretch = document.getElementById('goalStretch');
      const valBreathe = document.getElementById('valBreathe');
      const goalBreathe = document.getElementById('goalBreathe');
      const btnDrinkWater = document.getElementById('btnDrinkWater');
      const btnStretchBreak = document.getElementById('btnStretchBreak');
      const btnDeepBreathe = document.getElementById('btnDeepBreathe');
      const chillProgressFill = document.getElementById('chillProgressFill');
      const chillStatusQuote = document.getElementById('chillStatusQuote');
      const btnResetHabits = document.getElementById('btnResetHabits');
      const breathGuideBox = document.getElementById('breathGuideBox');
      const breathOrb = document.getElementById('breathOrb');
      const breathHint = document.getElementById('breathHint');

      // 1. ZEN TIMER LOGIC (TAP RING TO TOGGLE)
      function formatTime(totalSecs) {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
      }

      function updateTimerDisplay() {
        timerDigits.textContent = formatTime(state.timer.remainingSeconds);

        const progressFraction = state.timer.totalSeconds > 0
          ? (state.timer.totalSeconds - state.timer.remainingSeconds) / state.timer.totalSeconds
          : 0;
        const offset = RING_CIRCUMFERENCE * (1 - progressFraction);
        timerProgressRing.style.strokeDashoffset = offset.toString();

        timerRingToggle.classList.toggle('running', state.timer.isRunning);

        if (state.timer.isRunning) {
          timerSubtext.textContent = 'focusing • tap to pause';
        } else {
          timerSubtext.textContent = state.timer.remainingSeconds < state.timer.totalSeconds ? 'paused • tap to resume' : 'tap to focus';
        }

        btnModeFocus.classList.toggle('active', state.timer.mode === 'focus');
        btnModeShort.classList.toggle('active', state.timer.mode === 'shortBreak');
        btnModeLong.classList.toggle('active', state.timer.mode === 'longBreak');
      }

      function setTimerMode(mode, customMinutes) {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        state.timer.isRunning = false;
        state.timer.mode = mode;

        let minutes = 25;
        if (customMinutes) {
          minutes = customMinutes;
        } else if (mode === 'shortBreak') {
          minutes = 5;
        } else if (mode === 'longBreak') {
          minutes = 15;
        }

        state.timer.totalSeconds = minutes * 60;
        state.timer.remainingSeconds = state.timer.totalSeconds;

        updateTimerDisplay();
        persistState();
        notifyTimerState();
      }

      function toggleTimer() {
        if (state.timer.isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      }

      function startTimer() {
        if (state.timer.isRunning) return;
        state.timer.isRunning = true;
        updateTimerDisplay();
        notifyTimerState();

        timerInterval = setInterval(function () {
          if (state.timer.remainingSeconds > 0) {
            state.timer.remainingSeconds--;
            updateTimerDisplay();

            if (state.timer.remainingSeconds % 5 === 0) {
              persistState();
              notifyTimerState();
            }
          } else {
            clearInterval(timerInterval);
            timerInterval = null;
            state.timer.isRunning = false;
            updateTimerDisplay();
            persistState();

            playGentleChime();

            vscode.postMessage({
              type: 'TIMER_COMPLETED',
              mode: state.timer.mode
            });

            if (state.timer.mode === 'focus') {
              setTimerMode('shortBreak', 5);
            } else {
              setTimerMode('focus', 25);
            }
          }
        }, 1000);
      }

      function pauseTimer() {
        if (!state.timer.isRunning) return;
        clearInterval(timerInterval);
        timerInterval = null;
        state.timer.isRunning = false;
        updateTimerDisplay();
        persistState();
        notifyTimerState();
      }

      function resetTimer() {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        state.timer.isRunning = false;
        state.timer.remainingSeconds = state.timer.totalSeconds;
        updateTimerDisplay();
        persistState();
        notifyTimerState();
      }

      function notifyTimerState() {
        vscode.postMessage({
          type: 'TIMER_STATE_CHANGED',
          isRunning: state.timer.isRunning,
          mode: state.timer.mode,
          remainingSeconds: state.timer.remainingSeconds
        });
      }

      timerRingToggle.addEventListener('click', toggleTimer);
      btnResetTimer.addEventListener('click', resetTimer);
      btnModeFocus.addEventListener('click', function () { setTimerMode('focus', 25); });
      btnModeShort.addEventListener('click', function () { setTimerMode('shortBreak', 5); });
      btnModeLong.addEventListener('click', function () { setTimerMode('longBreak', 15); });

      // 2. PROCEDURAL SOUND ENGINE
      function getAudioContext() {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContextClass();

          masterGainNode = audioCtx.createGain();
          masterGainNode.gain.setValueAtTime(state.audio.volume, audioCtx.currentTime);
          masterGainNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        return audioCtx;
      }

      function createProceduralNoiseBuffer(durationSecs) {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * durationSecs;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
        return buffer;
      }

      function startRain() {
        const ctx = getAudioContext();
        if (rainSource) return;

        const noiseBuffer = createProceduralNoiseBuffer(5);
        rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filterLow = ctx.createBiquadFilter();
        filterLow.type = 'lowpass';
        filterLow.frequency.setValueAtTime(850, ctx.currentTime);

        const filterBand = ctx.createBiquadFilter();
        filterBand.type = 'bandpass';
        filterBand.frequency.setValueAtTime(1200, ctx.currentTime);
        filterBand.Q.setValueAtTime(1.5, ctx.currentTime);

        rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.5, ctx.currentTime);

        rainSource.connect(filterLow);
        filterLow.connect(filterBand);
        filterBand.connect(rainGain);
        rainGain.connect(masterGainNode);

        rainSource.start();
      }

      function stopRain() {
        if (rainSource) {
          try {
            rainSource.stop();
            rainSource.disconnect();
          } catch (e) {}
          rainSource = null;
          rainGain = null;
        }
      }

      function startWhiteNoise() {
        const ctx = getAudioContext();
        if (whiteNoiseSource) return;

        const noiseBuffer = createProceduralNoiseBuffer(4);
        whiteNoiseSource = ctx.createBufferSource();
        whiteNoiseSource.buffer = noiseBuffer;
        whiteNoiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1300, ctx.currentTime);

        whiteNoiseGain = ctx.createGain();
        whiteNoiseGain.gain.setValueAtTime(0.35, ctx.currentTime);

        whiteNoiseSource.connect(filter);
        filter.connect(whiteNoiseGain);
        whiteNoiseGain.connect(masterGainNode);

        whiteNoiseSource.start();
      }

      function stopWhiteNoise() {
        if (whiteNoiseSource) {
          try {
            whiteNoiseSource.stop();
            whiteNoiseSource.disconnect();
          } catch (e) {}
          whiteNoiseSource = null;
          whiteNoiseGain = null;
        }
      }

      function startLofiDrone() {
        const ctx = getAudioContext();
        if (lofiNodes.length > 0) return;

        const chordFreqs = [130.81, 196.00, 246.94, 293.66, 329.63];

        chordFreqs.forEach(function (freq, index) {
          const osc = ctx.createOscillator();
          osc.type = index % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const detune = (Math.random() - 0.5) * 4;
          osc.detune.setValueAtTime(detune, ctx.currentTime);

          const lofiFilter = ctx.createBiquadFilter();
          lofiFilter.type = 'lowpass';
          lofiFilter.frequency.setValueAtTime(450 + index * 60, ctx.currentTime);

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.045, ctx.currentTime);

          osc.connect(lofiFilter);
          lofiFilter.connect(gainNode);
          gainNode.connect(masterGainNode);

          osc.start();
          lofiNodes.push({ osc: osc, filter: lofiFilter, gain: gainNode });
        });
      }

      function stopLofiDrone() {
        if (lofiNodes.length > 0) {
          lofiNodes.forEach(function (item) {
            try {
              item.osc.stop();
              item.osc.disconnect();
            } catch (e) {}
          });
          lofiNodes = [];
        }
      }

      function playGentleChime() {
        try {
          const ctx = getAudioContext();
          const notes = [523.25, 659.25, 783.99];
          notes.forEach(function (freq, i) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.16);

            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.16);
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.16 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 1.2);

            osc.connect(gain);
            gain.connect(masterGainNode);

            osc.start(ctx.currentTime + i * 0.16);
            osc.stop(ctx.currentTime + i * 0.16 + 1.3);
          });
        } catch (e) {}
      }

      function stopAllAudio() {
        state.audio.rain = false;
        state.audio.lofi = false;
        state.audio.whiteNoise = false;
        stopRain();
        stopLofiDrone();
        stopWhiteNoise();
        if (masterGainNode && audioCtx) {
          try {
            masterGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          } catch (e) {}
        }
        if (audioCtx && audioCtx.state !== 'closed') {
          try {
            audioCtx.suspend();
          } catch (e) {}
        }
        updateAudioUI();
        persistState();
      }

      function updateAudioUI() {
        nodeRain.classList.toggle('active', state.audio.rain);
        nodeLofi.classList.toggle('active', state.audio.lofi);
        nodeWhiteNoise.classList.toggle('active', state.audio.whiteNoise);

        const hasActiveSound = state.audio.rain || state.audio.lofi || state.audio.whiteNoise;

        btnMasterAudioToggle.classList.toggle('visible', hasActiveSound);
        volumeBox.classList.toggle('show', hasActiveSound);
      }

      btnMasterAudioToggle.addEventListener('click', function () {
        stopAllAudio();
        vscode.postMessage({ type: 'STOP_ALL_AUDIO' });
      });

      nodeRain.addEventListener('click', function () {
        state.audio.rain = !state.audio.rain;
        if (state.audio.rain) {
          startRain();
        } else {
          stopRain();
        }
        updateAudioUI();
        persistState();
      });

      nodeLofi.addEventListener('click', function () {
        state.audio.lofi = !state.audio.lofi;
        if (state.audio.lofi) {
          startLofiDrone();
        } else {
          stopLofiDrone();
        }
        updateAudioUI();
        persistState();
      });

      nodeWhiteNoise.addEventListener('click', function () {
        state.audio.whiteNoise = !state.audio.whiteNoise;
        if (state.audio.whiteNoise) {
          startWhiteNoise();
        } else {
          stopWhiteNoise();
        }
        updateAudioUI();
        persistState();
      });

      masterVolumeRange.addEventListener('input', function (e) {
        const val = parseInt(e.target.value, 10);
        state.audio.volume = val / 100;
        volumeValueText.textContent = val + '%';
        if (masterGainNode && audioCtx) {
          masterGainNode.gain.setValueAtTime(state.audio.volume, audioCtx.currentTime);
        }
        persistState();
      });

      // 3. ONE-TOUCH CHILL HABITS LOGIC
      function updateHabitsUI() {
        valWater.textContent = state.habits.waterCount.toString();
        goalWater.textContent = '/' + state.habits.waterGoal;
        btnDrinkWater.classList.toggle('goal-reached', state.habits.waterCount >= state.habits.waterGoal);

        valStretch.textContent = state.habits.stretchCount.toString();
        goalStretch.textContent = '/' + state.habits.stretchGoal;
        btnStretchBreak.classList.toggle('goal-reached', state.habits.stretchCount >= state.habits.stretchGoal);

        valBreathe.textContent = state.habits.breatheCount.toString();
        goalBreathe.textContent = '/' + state.habits.breatheGoal;
        btnDeepBreathe.classList.toggle('goal-reached', state.habits.breatheCount >= state.habits.breatheGoal);

        const waterScore = Math.min(state.habits.waterCount / state.habits.waterGoal, 1);
        const stretchScore = Math.min(state.habits.stretchCount / state.habits.stretchGoal, 1);
        const breatheScore = Math.min(state.habits.breatheCount / state.habits.breatheGoal, 1);
        const totalProgress = Math.round(((waterScore * 0.4) + (stretchScore * 0.35) + (breatheScore * 0.25)) * 100);

        chillProgressFill.style.width = totalProgress + '%';

        if (totalProgress >= 100) {
          chillStatusQuote.textContent = '100% serene zen';
          chillStatusQuote.style.color = 'var(--color-sage)';
        } else if (totalProgress >= 50) {
          chillStatusQuote.textContent = totalProgress + '% calm balance';
          chillStatusQuote.style.color = 'var(--color-lavender)';
        } else {
          chillStatusQuote.textContent = totalProgress + '% mindful flow';
          chillStatusQuote.style.color = 'var(--color-slate)';
        }
      }

      function logHabit(habitKey) {
        if (habitKey === 'water') {
          state.habits.waterCount++;
          vscode.postMessage({
            type: 'HABIT_LOGGED',
            habit: 'water',
            count: state.habits.waterCount,
            goal: state.habits.waterGoal
          });
        } else if (habitKey === 'stretch') {
          state.habits.stretchCount++;
          vscode.postMessage({
            type: 'HABIT_LOGGED',
            habit: 'stretch',
            count: state.habits.stretchCount,
            goal: state.habits.stretchGoal
          });
        } else if (habitKey === 'breathe') {
          state.habits.breatheCount++;
          triggerGuidedBreathing();
          vscode.postMessage({
            type: 'HABIT_LOGGED',
            habit: 'breathe',
            count: state.habits.breatheCount,
            goal: state.habits.breatheGoal
          });
        }
        updateHabitsUI();
        persistState();
      }

      let breathingTimeout1 = null;
      let breathingTimeout2 = null;
      let breathingTimeout3 = null;

      function stopGuidedBreathing() {
        if (breathingTimeout1) clearTimeout(breathingTimeout1);
        if (breathingTimeout2) clearTimeout(breathingTimeout2);
        if (breathingTimeout3) clearTimeout(breathingTimeout3);
        breathingTimeout1 = null;
        breathingTimeout2 = null;
        breathingTimeout3 = null;
        breathGuideBox.classList.remove('show');
        breathOrb.className = 'breath-orb';
      }

      function triggerGuidedBreathing() {
        stopGuidedBreathing();

        breathGuideBox.classList.add('show');
        breathOrb.className = 'breath-orb inhale';
        breathHint.textContent = 'Inhale gently (4s)...';

        breathingTimeout1 = setTimeout(function () {
          breathHint.textContent = 'Hold breath (4s)...';
          breathingTimeout2 = setTimeout(function () {
            breathOrb.className = 'breath-orb exhale';
            breathHint.textContent = 'Exhale slowly (4s)...';
            breathingTimeout3 = setTimeout(function () {
              stopGuidedBreathing();
            }, 3000);
          }, 3000);
        }, 3000);
      }

      breathGuideBox.addEventListener('click', stopGuidedBreathing);
      btnDrinkWater.addEventListener('click', function () { logHabit('water'); });
      btnStretchBreak.addEventListener('click', function () { logHabit('stretch'); });
      btnDeepBreathe.addEventListener('click', function () { logHabit('breathe'); });

      btnResetHabits.addEventListener('click', function () {
        state.habits.waterCount = 0;
        state.habits.stretchCount = 0;
        state.habits.breatheCount = 0;
        updateHabitsUI();
        persistState();
      });

      // 4. STATE RESTORATION & MESSAGING
      function persistState() {
        vscode.setState(state);
        vscode.postMessage({
          type: 'STATE_SAVE',
          state: state
        });
      }

      function checkDailyRollover() {
        const today = new Date().toISOString().slice(0, 10);
        if (state.habits.lastUpdatedDate !== today) {
          state.habits.waterCount = 0;
          state.habits.stretchCount = 0;
          state.habits.breatheCount = 0;
          state.habits.lastUpdatedDate = today;
          persistState();
        }
      }

      window.addEventListener('message', function (event) {
        const message = event.data;
        if (!message || !message.type) return;

        switch (message.type) {
          case 'INIT_STATE': {
            if (message.state) {
              if (message.state.timer) {
                state.timer.mode = message.state.timer.mode || 'focus';
                state.timer.remainingSeconds = message.state.timer.remainingSeconds ?? 25 * 60;
                state.timer.totalSeconds = message.state.timer.totalSeconds ?? 25 * 60;
              }
              if (message.state.audio) {
                state.audio.volume = message.state.audio.volume ?? 0.25;
                masterVolumeRange.value = Math.round(state.audio.volume * 100).toString();
                volumeValueText.textContent = masterVolumeRange.value + '%';
              }
              if (message.state.habits) {
                state.habits.waterCount = message.state.habits.waterCount ?? 0;
                state.habits.waterGoal = message.state.habits.waterGoal ?? 8;
                state.habits.stretchCount = message.state.habits.stretchCount ?? 4;
                state.habits.stretchGoal = message.state.habits.stretchGoal ?? 4;
                state.habits.breatheCount = message.state.habits.breatheCount ?? 0;
                state.habits.breatheGoal = message.state.habits.breatheGoal ?? 3;
                state.habits.lastUpdatedDate = message.state.habits.lastUpdatedDate || new Date().toISOString().slice(0, 10);
              }
            }
            state.audio.rain = false;
            state.audio.lofi = false;
            state.audio.whiteNoise = false;
            stopRain();
            stopLofiDrone();
            stopWhiteNoise();
            checkDailyRollover();
            updateTimerDisplay();
            updateAudioUI();
            updateHabitsUI();
            break;
          }

          case 'STOP_ALL_AUDIO': {
            stopAllAudio();
            break;
          }

          case 'TRIGGER_ACTION': {
            if (message.action === 'drinkWater') {
              logHabit('water');
            } else if (message.action === 'stretch') {
              logHabit('stretch');
            } else if (message.action === 'deepBreathe') {
              logHabit('breathe');
            } else if (message.action === 'toggleTimer') {
              toggleTimer();
            } else if (message.action === 'resetHabits') {
              state.habits.waterCount = 0;
              state.habits.stretchCount = 0;
              state.habits.breatheCount = 0;
              updateHabitsUI();
              persistState();
            }
            break;
          }

          case 'CONFIG_UPDATED': {
            if (message.config) {
              state.habits.waterGoal = message.config.waterGoal;
              state.habits.stretchGoal = message.config.stretchGoal;
              state.habits.breatheGoal = message.config.breatheGoal;
              updateHabitsUI();
            }
            break;
          }
        }
      });

      const previousState = vscode.getState();
      if (previousState) {
        Object.assign(state, previousState);
      }
      state.audio.rain = false;
      state.audio.lofi = false;
      state.audio.whiteNoise = false;
      stopRain();
      stopLofiDrone();
      stopWhiteNoise();

      checkDailyRollover();
      updateTimerDisplay();
      updateAudioUI();
      updateHabitsUI();

      window.addEventListener('beforeunload', stopAllAudio);
      window.addEventListener('pagehide', stopAllAudio);

      vscode.postMessage({ type: 'READY' });
    })();
  </script>
</body>
</html>`;
  }

  private generateNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
