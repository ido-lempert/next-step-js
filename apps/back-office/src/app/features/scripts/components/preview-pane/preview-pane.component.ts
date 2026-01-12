import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect,
  input,
  signal,
  inject,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PreviewBridgeService } from '../../services/preview-bridge.service';
import { Script } from '../../models/script.model';
import { ExtensionPromptComponent } from './extension-prompt.component';

@Component({
  selector: 'app-preview-pane',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    FormsModule,
    ExtensionPromptComponent,
  ],
  templateUrl: './preview-pane.component.html',
  styleUrl: './preview-pane.component.css',
})
export class PreviewPaneComponent implements OnInit, OnDestroy {
  @ViewChild('previewFrame') iframeRef!: ElementRef<HTMLIFrameElement>;
  @Input({ required: true }) script!: Script;

  private readonly previewBridge = inject(PreviewBridgeService);

  extensionDetected = this.previewBridge.extensionDetected;
  currentStep = this.previewBridge.currentStep;
  previewError = this.previewBridge.previewError;

  targetUrl = signal('');
  isFullscreen = signal(false);
  isPlaying = signal(false);

  ngOnInit() {
    // Detect extension on init
    this.detectExtension();

    // Start listening for messages
    this.previewBridge.startListening(this.handleMessage);
  }

  ngOnDestroy() {
    this.previewBridge.stopListening();
    this.previewBridge.clearState();
  }

  async onIframeLoad() {
    if (this.iframeRef?.nativeElement) {
      this.previewBridge.setIframe(this.iframeRef.nativeElement);
      
      // Detect extension after iframe loads
      await this.previewBridge.detectExtension();
      
      // If extension detected and we have a script, load it
      if (this.previewBridge.extensionDetected() && this.script) {
        setTimeout(() => {
          this.previewBridge.loadScript(this.script!);
        }, 500); // Small delay to ensure iframe is ready
      }
    }
  }

  async detectExtension() {
    await this.previewBridge.detectExtension();
  }

  playScript() {
    this.previewBridge.playScript();
  }

  stopScript() {
    this.previewBridge.stopScript();
  }

  reloadPreview() {
    this.previewBridge.reloadPreview();
  }

  loadUrl() {
    // URL has changed, wait for iframe to load
    this.previewBridge.clearState();
  }

  toggleFullscreen() {
    // Toggle fullscreen mode
    this.isFullscreen.update(v => !v);
  }

  handleMessage = (event: MessageEvent) => {
    // Additional custom handling if needed
    console.log('Preview message received:', event.data);
  };
}
