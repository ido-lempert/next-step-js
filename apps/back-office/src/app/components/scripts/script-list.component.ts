import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScriptService } from '../../services/script.service';
import { ProductService } from '../../services/product.service';
import { Script, ScriptType, ScriptStatus } from '../../models/script.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-script-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './script-list.component.html',
  styleUrls: ['./script-list.component.css'],
})
export class ScriptListComponent implements OnInit {
  scriptToDelete = signal<Script | null>(null);
  showDeleteDialog = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  productId = signal<string>('');
  product = signal<Product | null>(null);
  
  newScriptName = signal<string>('');
  newScriptType = signal<ScriptType>('walkthrough');
  
  filterType = signal<ScriptType | 'all'>('all');
  filterStatus = signal<ScriptStatus | 'all'>('all');

  filteredScripts = computed(() => {
    let scripts = this.scriptService.scripts();
    
    if (this.filterType() !== 'all') {
      scripts = scripts.filter(s => s.type === this.filterType());
    }
    
    if (this.filterStatus() !== 'all') {
      scripts = scripts.filter(s => s.status === this.filterStatus());
    }
    
    return scripts;
  });

  constructor(
    public scriptService: ScriptService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.productId.set(productId);
      this.loadProduct(productId);
      this.scriptService.loadScriptsByProduct(productId).subscribe();
    }
  }

  loadProduct(productId: string) {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product.set(product);
      },
      error: (err) => {
        console.error('Error loading product:', err);
      },
    });
  }

  onShowCreateDialog() {
    this.newScriptName.set('');
    this.newScriptType.set('walkthrough');
    this.showCreateDialog.set(true);
  }

  onCreateScript() {
    const name = this.newScriptName().trim();
    if (!name) {
      return;
    }

    this.scriptService.createScript(this.productId(), {
      name,
      type: this.newScriptType(),
    }).subscribe({
      next: () => {
        this.showCreateDialog.set(false);
      },
      error: (err) => {
        console.error('Error creating script:', err);
      },
    });
  }

  onDelete(script: Script) {
    this.scriptToDelete.set(script);
    this.showDeleteDialog.set(true);
  }

  confirmDelete() {
    const script = this.scriptToDelete();
    if (script) {
      this.scriptService.deleteScript(script.id).subscribe({
        next: () => {
          this.showDeleteDialog.set(false);
          this.scriptToDelete.set(null);
        },
        error: (err) => {
          console.error('Error deleting script:', err);
        },
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog.set(false);
    this.scriptToDelete.set(null);
  }

  cancelCreate() {
    this.showCreateDialog.set(false);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  getTypeBadgeClass(type: ScriptType): string {
    return type === 'walkthrough' ? 'badge-walkthrough' : 'badge-modal';
  }

  getStatusBadgeClass(status: ScriptStatus): string {
    return status === 'published' ? 'badge-published' : 'badge-draft';
  }
}
