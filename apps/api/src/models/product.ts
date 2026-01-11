export interface Product {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
}
