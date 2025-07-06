import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { CreateProductRequest, CreateProductResponse } from '../../../shared/types/product';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateProductResponse, Error, CreateProductRequest>({
    mutationFn: (productData: CreateProductRequest) => api.products.create(productData),
    onSuccess: (data) => {
      // Invalidate and refetch products list to show the new product
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Product created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
}; 