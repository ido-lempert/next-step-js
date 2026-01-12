import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ScriptListComponent } from './script-list.component';

describe('ScriptListComponent', () => {
  let component: ScriptListComponent;
  let fixture: ComponentFixture<ScriptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScriptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty filters', () => {
    expect(component.filterType()).toBe('all');
    expect(component.filterStatus()).toBe('all');
  });

  it('should show create dialog when onShowCreateDialog is called', () => {
    expect(component.showCreateDialog()).toBe(false);
    component.onShowCreateDialog();
    expect(component.showCreateDialog()).toBe(true);
  });

  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = component.formatDate(date);
    expect(formatted).toBeTruthy();
  });

  it('should get correct badge classes', () => {
    expect(component.getTypeBadgeClass('walkthrough')).toBe('badge-walkthrough');
    expect(component.getTypeBadgeClass('modal')).toBe('badge-modal');
    expect(component.getStatusBadgeClass('published')).toBe('badge-published');
    expect(component.getStatusBadgeClass('draft')).toBe('badge-draft');
  });
});
