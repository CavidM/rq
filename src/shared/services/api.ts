import { Product, CreateProductRequest, CreateProductResponse } from '../types/product';

const BASE_URL = 'https://fakestoreapi.com';

// Simple helper functions to eliminate repetition
async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

async function post<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

// Clean, simple API functions
export const api = {
  products: {
    getAll: () => get<Product[]>('/products'),
    getById: (id: number) => get<Product>(`/products/${id}`),
    create: (data: CreateProductRequest) => post<CreateProductResponse>('/products', data),
    getCategories: () => get<string[]>('/products/categories'),
  },
}; 