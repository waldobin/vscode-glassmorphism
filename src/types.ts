export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusTimerState {
  mode: PomodoroMode;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

export interface AmbientAudioState {
  rain: boolean;
  lofi: boolean;
  whiteNoise: boolean;
  volume: number;
}

export interface ChillHabitsState {
  waterCount: number;
  waterGoal: number;
  stretchCount: number;
  stretchGoal: number;
  breatheCount: number;
  breatheGoal: number;
  lastUpdatedDate: string;
}

export interface ChillAppState {
  timer: FocusTimerState;
  audio: AmbientAudioState;
  habits: ChillHabitsState;
}

export type WebviewToExtensionMessage =
  | { type: 'READY' }
  | { type: 'STATE_SAVE'; state: ChillAppState }
  | { type: 'HABIT_LOGGED'; habit: 'water' | 'stretch' | 'breathe'; count: number; goal: number }
  | { type: 'TIMER_STATE_CHANGED'; isRunning: boolean; mode: PomodoroMode; remainingSeconds: number }
  | { type: 'TIMER_COMPLETED'; mode: PomodoroMode }
  | { type: 'SHOW_NOTIFICATION'; message: string }
  | { type: 'STOP_ALL_AUDIO' };

export type ExtensionToWebviewMessage =
  | { type: 'INIT_STATE'; state?: ChillAppState }
  | { type: 'TRIGGER_ACTION'; action: 'drinkWater' | 'stretch' | 'deepBreathe' | 'toggleTimer' | 'resetHabits' }
  | { type: 'CONFIG_UPDATED'; config: { pomodoroMin: number; shortBreakMin: number; longBreakMin: number; waterGoal: number; stretchGoal: number; breatheGoal: number; soundEnabled: boolean } }
  | { type: 'STOP_ALL_AUDIO' };
