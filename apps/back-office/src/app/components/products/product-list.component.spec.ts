import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { ProjectService } from '../../services/project.service';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: ProductService;
  let projectService: ProjectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
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
                get: (key: string) => (key === 'projectId' ? 'project-1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    projectService = TestBed.inject(ProjectService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const mockProducts = [
      {
        id: '1',
        project_id: 'project-1',
        name: 'Product 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.spyOn(productService, 'loadProductsByProject').mockReturnValue(of(mockProducts));
    vi.spyOn(projectService, 'getProject').mockReturnValue(of({
      id: 'project-1',
      tenant_id: 'tenant-1',
      name: 'Project 1',
      created_at: new Date(),
      updated_at: new Date(),
    }));

    fixture.detectChanges();

    expect(component.projectId()).toBe('project-1');
    expect(productService.loadProductsByProject).toHaveBeenCalledWith('project-1');
  });

  it('should open delete dialog when onDelete is called', () => {
    const product = {
      id: '1',
      project_id: 'project-1',
      name: 'Product 1',
      created_at: new Date(),
      updated_at: new Date(),
    };

    component.onDelete(product);

    expect(component.productToDelete()).toEqual(product);
    expect(component.showDeleteDialog()).toBe(true);
  });

  it('should cancel delete', () => {
    const product = {
      id: '1',
      project_id: 'project-1',
      name: 'Product 1',
      created_at: new Date(),
      updated_at: new Date(),
    };

    component.onDelete(product);
    component.cancelDelete();

    expect(component.productToDelete()).toBeNull();
    expect(component.showDeleteDialog()).toBe(false);
  });
});
