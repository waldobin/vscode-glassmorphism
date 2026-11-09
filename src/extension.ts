import * as vscode from 'vscode';
import { ChillViewProvider } from './ChillViewProvider';
import { PomodoroMode } from './types';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // 1. Initialize Primary Sidebar Webview Provider
  const provider = new ChillViewProvider(context.extensionUri, context.globalState);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChillViewProvider.viewType, provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    })
  );

  // 2. Ultra-Minimalist Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.name = 'Glassmorphism Status';
  statusBarItem.text = '$(sparkle) Chill';
  statusBarItem.tooltip = 'Glassmorphism: Mindful Workspace (Click to focus)';
  statusBarItem.command = 'vscode-glassmorphism.chillView.focus';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // 3. Connect Provider Events to Status Bar & Notifications
  provider.onTimerState((isRunning: boolean, mode: PomodoroMode, remainingSeconds: number) => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const timeFormatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (isRunning) {
      const modeLabel = mode === 'focus' ? 'Focus' : 'Rest';
      statusBarItem.text = `$(watch) ${timeFormatted} (${modeLabel})`;
    } else {
      statusBarItem.text = '$(sparkle) Chill';
    }
  });

  provider.onTimerCompleted((mode: PomodoroMode) => {
    const message = mode === 'focus'
      ? '🌿 Focus session completed! Take a soothing breath and stretch.'
      : '✨ Rest break finished! Ready to begin your next calm focus block?';

    vscode.window.showInformationMessage(message, 'Drink Water', 'Stretch Break').then((selection) => {
      if (selection === 'Drink Water') {
        provider.triggerExternalAction('drinkWater');
      } else if (selection === 'Stretch Break') {
        provider.triggerExternalAction('stretch');
      }
    });
  });

  provider.onHabitLogged((habit: 'water' | 'stretch' | 'breathe', count: number, goal: number) => {
    if (count >= goal) {
      vscode.window.showInformationMessage(`🎉 Goal reached for daily ${habit}! You are in the mindful flow.`);
    }
  });

  // 4. Curated Essential Command Registrations
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-glassmorphism.openEditorPanel', () => {
      provider.openInEditorPanel();
    }),

    vscode.commands.registerCommand('vscode-glassmorphism.toggleTimer', () => {
      provider.triggerExternalAction('toggleTimer');
    }),

    vscode.commands.registerCommand('vscode-glassmorphism.stopAllAudio', () => {
      provider.stopAllAudio();
      vscode.window.showInformationMessage('🔇 Glassmorphism: All ambient audio stopped.');
    })
  );

  // 5. Watch for Workspace Configuration Changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('vscode-glassmorphism')) {
        provider.notifyConfigUpdate();
      }
    })
  );
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
