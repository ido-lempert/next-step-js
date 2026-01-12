import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScriptService } from '../../services/script.service';

@Component({
  selector: 'app-script-preview',
  imports: [CommonModule, RouterModule],
  templateUrl: './script-preview.component.html',
  styleUrls: ['./script-preview.component.css'],
})
export class ScriptPreviewComponent implements OnInit {
  scriptId = signal<string>('');
  previewUrl = signal<string>('about:blank');

  constructor(
    public scriptService: ScriptService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const scriptId = this.route.snapshot.paramMap.get('id');
    if (scriptId) {
      this.scriptId.set(scriptId);
      this.scriptService.getScript(scriptId).subscribe();
    }
  }

  onBack() {
    this.router.navigate(['/scripts', this.scriptId(), 'editor']);
  }

  onChangeUrl(event: Event) {
    const url = (event.target as HTMLInputElement).value;
    this.previewUrl.set(url);
  }
}
