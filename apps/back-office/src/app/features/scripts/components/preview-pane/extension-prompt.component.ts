import { Component, inject, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PreviewBridgeService } from '../../services/preview-bridge.service';

@Component({
  selector: 'app-extension-prompt',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="extension-prompt">
      <mat-card-header>
        <mat-icon class="warning-icon">warning</mat-icon>
        <mat-card-title>Chrome Extension Required</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>To preview scripts in the iframe, you need to install the Next-Step Preview Extension.</p>
        <p>The extension allows the preview to bypass Cross-Origin restrictions and inject scripts into the target website.</p>
        <ol>
          <li>Install the Chrome Extension</li>
          <li>Enable the extension for this site</li>
          <li>Click "Check Again" below</li>
        </ol>
      </mat-card-content>
      <mat-card-actions>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          mat-raised-button
          color="primary"
        >
          <mat-icon>extension</mat-icon>
          Install Extension
        </a>
        <button mat-button (click)="checkAgain()">
          <mat-icon>refresh</mat-icon>
          Check Again
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .extension-prompt {
      margin: 20px;
      max-width: 600px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 24px;
      text-align: center;
    }

    mat-card-content {
      text-align: left;
    }

    mat-card-content p {
      margin-bottom: 12px;
    }

    mat-card-content ol {
      padding-left: 20px;
      margin: 16px 0;
    }

    mat-card-content li {
      margin-bottom: 8px;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      padding: 16px;
    }
  `],
})
export class ExtensionPromptComponent {
  private readonly previewBridge = inject(PreviewBridgeService);

  async checkAgain() {
    await this.previewBridge.detectExtension();
  }
}
