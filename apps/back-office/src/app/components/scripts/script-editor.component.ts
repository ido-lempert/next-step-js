import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ScriptService } from '../../services/script.service';
import { ScriptStep, ScriptType } from '../../models/script.model';

@Component({
  selector: 'app-script-editor',
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.css'],
})
export class ScriptEditorComponent implements OnInit {
  scriptId = signal<string>('');
  editingScriptName = signal<boolean>(false);
  tempScriptName = signal<string>('');
  
  showStepDialog = signal<boolean>(false);
  editingStep = signal<ScriptStep | null>(null);
  
  stepTitle = signal<string>('');
  stepDescription = signal<string>('');
  stepSelector = signal<string>('');
  stepActionType = signal<string>('click');
  
  expandedSteps = signal<Set<string>>(new Set());

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

  onEditScriptName() {
    const script = this.scriptService.currentScript();
    if (script) {
      this.tempScriptName.set(script.name);
      this.editingScriptName.set(true);
    }
  }

  onSaveScriptName() {
    const name = this.tempScriptName().trim();
    if (name) {
      this.scriptService.updateScript(this.scriptId(), { name }).subscribe({
        next: () => {
          this.editingScriptName.set(false);
        },
      });
    }
  }

  onCancelScriptName() {
    this.editingScriptName.set(false);
  }

  onChangeType(event: Event) {
    const type = (event.target as HTMLSelectElement).value as ScriptType;
    this.scriptService.updateScript(this.scriptId(), { type }).subscribe();
  }

  onTogglePublish() {
    const script = this.scriptService.currentScript();
    if (!script) return;

    if (script.status === 'draft') {
      this.scriptService.publishScript(script.id).subscribe({
        error: (err) => {
          alert('Cannot publish script without steps');
        },
      });
    } else {
      this.scriptService.unpublishScript(script.id).subscribe();
    }
  }

  onShowAddStep() {
    this.editingStep.set(null);
    this.stepTitle.set('');
    this.stepDescription.set('');
    this.stepSelector.set('');
    this.stepActionType.set('click');
    this.showStepDialog.set(true);
  }

  onShowEditStep(step: ScriptStep) {
    this.editingStep.set(step);
    this.stepTitle.set(step.title);
    this.stepDescription.set(step.description || '');
    this.stepSelector.set(step.element_selector || '');
    this.stepActionType.set(step.action_type || 'click');
    this.showStepDialog.set(true);
  }

  onSaveStep() {
    const title = this.stepTitle().trim();
    if (!title) return;

    const stepData = {
      title,
      description: this.stepDescription().trim() || undefined,
      element_selector: this.stepSelector().trim() || undefined,
      action_type: this.stepActionType() as any,
    };

    const editingStep = this.editingStep();
    if (editingStep) {
      this.scriptService
        .updateStep(this.scriptId(), editingStep.id, stepData)
        .subscribe({
          next: () => {
            this.showStepDialog.set(false);
          },
        });
    } else {
      this.scriptService.createStep(this.scriptId(), stepData).subscribe({
        next: () => {
          this.showStepDialog.set(false);
        },
      });
    }
  }

  onCancelStep() {
    this.showStepDialog.set(false);
  }

  onDeleteStep(step: ScriptStep) {
    if (confirm(`Are you sure you want to delete step "${step.title}"?`)) {
      this.scriptService.deleteStep(this.scriptId(), step.id).subscribe();
    }
  }

  onDrop(event: CdkDragDrop<ScriptStep[]>) {
    const script = this.scriptService.currentScript();
    if (!script) return;

    const steps = [...script.steps];
    moveItemInArray(steps, event.previousIndex, event.currentIndex);

    const stepIds = steps.map(s => s.id);
    this.scriptService.reorderSteps(this.scriptId(), { stepIds }).subscribe();
  }

  toggleStepExpanded(stepId: string) {
    const expanded = this.expandedSteps();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    this.expandedSteps.set(newExpanded);
  }

  isStepExpanded(stepId: string): boolean {
    return this.expandedSteps().has(stepId);
  }

  onPreview() {
    this.router.navigate(['/scripts', this.scriptId(), 'preview']);
  }

  onBack() {
    const script = this.scriptService.currentScript();
    if (script) {
      this.router.navigate(['/products', script.product_id, 'scripts']);
    }
  }
}
