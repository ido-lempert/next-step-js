import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ScriptService } from './script.service';
import { Script, CreateScriptDto, ScriptStep } from '../models/script.model';

describe('ScriptService', () => {
  let service: ScriptService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3333/api';
  const tenantId = 'tenant-1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScriptService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ScriptService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load scripts by product', () => {
    const productId = 'product-1';
    const mockScripts: Script[] = [
      {
        id: 'script-1',
        product_id: productId,
        name: 'Test Script',
        type: 'walkthrough',
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        step_count: 2,
      },
    ];

    service.loadScriptsByProduct(productId).subscribe(() => {
      expect(service.scripts()).toEqual(mockScripts);
    });

    const req = httpMock.expectOne(`${apiUrl}/products/${productId}/scripts`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Tenant-Id')).toBe(tenantId);
    req.flush(mockScripts);
  });

  it('should get a single script', () => {
    const scriptId = 'script-1';
    const mockScript = {
      id: scriptId,
      product_id: 'product-1',
      name: 'Test Script',
      type: 'walkthrough' as const,
      status: 'draft' as const,
      created_at: new Date(),
      updated_at: new Date(),
      steps: [] as ScriptStep[],
    };

    service.getScript(scriptId).subscribe(() => {
      expect(service.currentScript()).toEqual(mockScript);
    });

    const req = httpMock.expectOne(`${apiUrl}/scripts/${scriptId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockScript);
  });

  it('should create a script', () => {
    const productId = 'product-1';
    const dto: CreateScriptDto = {
      name: 'New Script',
      type: 'modal',
    };
    const mockScript: Script = {
      id: 'new-script',
      product_id: productId,
      name: dto.name,
      type: dto.type,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
    };

    service.createScript(productId, dto).subscribe(() => {
      expect(service.scripts()).toContain(mockScript);
    });

    const req = httpMock.expectOne(`${apiUrl}/products/${productId}/scripts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockScript);
  });

  it('should publish a script', () => {
    const scriptId = 'script-1';
    const mockScript: Script = {
      id: scriptId,
      product_id: 'product-1',
      name: 'Test Script',
      type: 'walkthrough',
      status: 'published',
      created_at: new Date(),
      updated_at: new Date(),
    };

    service.publishScript(scriptId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/scripts/${scriptId}/publish`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockScript);
  });

  it('should create a step', () => {
    const scriptId = 'script-1';
    const stepDto = {
      title: 'Step 1',
      description: 'First step',
    };
    const mockStep: ScriptStep = {
      id: 'step-1',
      script_id: scriptId,
      order_index: 0,
      title: stepDto.title,
      description: stepDto.description,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Set current script first
    service.currentScript.set({
      id: scriptId,
      product_id: 'product-1',
      name: 'Test',
      type: 'walkthrough',
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
      steps: [],
    });

    service.createStep(scriptId, stepDto).subscribe(() => {
      const currentScript = service.currentScript();
      expect(currentScript?.steps).toContain(mockStep);
    });

    const req = httpMock.expectOne(`${apiUrl}/scripts/${scriptId}/steps`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(stepDto);
    req.flush(mockStep);
  });

  it('should reorder steps', () => {
    const scriptId = 'script-1';
    const stepIds = ['step-2', 'step-1', 'step-3'];
    const mockSteps: ScriptStep[] = stepIds.map((id, index) => ({
      id,
      script_id: scriptId,
      order_index: index,
      title: `Step ${index + 1}`,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // Set current script first
    service.currentScript.set({
      id: scriptId,
      product_id: 'product-1',
      name: 'Test',
      type: 'walkthrough',
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
      steps: [],
    });

    service.reorderSteps(scriptId, { stepIds }).subscribe(() => {
      const currentScript = service.currentScript();
      expect(currentScript?.steps).toEqual(mockSteps);
    });

    const req = httpMock.expectOne(`${apiUrl}/scripts/${scriptId}/steps/reorder`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ stepIds });
    req.flush(mockSteps);
  });

  it('should delete a script', () => {
    const scriptId = 'script-1';
    const initialScript: Script = {
      id: scriptId,
      product_id: 'product-1',
      name: 'Test',
      type: 'walkthrough',
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date(),
    };
    service.scripts.set([initialScript]);

    service.deleteScript(scriptId).subscribe(() => {
      expect(service.scripts()).not.toContain(initialScript);
    });

    const req = httpMock.expectOne(`${apiUrl}/scripts/${scriptId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
