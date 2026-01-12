export interface Product {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
}
