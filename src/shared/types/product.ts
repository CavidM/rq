export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CreateProductRequest {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface CreateProductResponse {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
} 