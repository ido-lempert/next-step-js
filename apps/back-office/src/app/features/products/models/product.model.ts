export interface Product {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
}
