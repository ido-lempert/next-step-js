import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { ProjectService } from '../../services/project.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: ProductService;
  let projectService: ProjectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductFormComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        ProductService,
        ProjectService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'projectId') return 'project-1';
                  return null;
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    projectService = TestBed.inject(ProjectService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('description')?.value).toBe('');
  });

  it('should require name field', () => {
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('Product Name');
    expect(nameControl?.hasError('required')).toBe(false);
  });

  it('should validate name max length', () => {
    const nameControl = component.productForm.get('name');
    const longName = 'a'.repeat(256);
    nameControl?.setValue(longName);
    expect(nameControl?.hasError('maxlength')).toBe(true);
  });

  it('should set edit mode when product id is provided', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.paramMap.get = (key: string) => {
      if (key === 'projectId') return 'project-1';
      if (key === 'id') return 'product-1';
      return null;
    };

    vi.spyOn(projectService, 'getProject').mockReturnValue(of({
      id: 'project-1',
      tenant_id: 'tenant-1',
      name: 'Project 1',
      created_at: new Date(),
      updated_at: new Date(),
    }));

    vi.spyOn(productService, 'loadProductsByProject').mockReturnValue(of([]));

    component.ngOnInit();

    expect(component.projectId()).toBe('project-1');
  });
});
