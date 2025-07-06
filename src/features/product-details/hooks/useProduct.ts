import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.getById(id),
    enabled: !!id,
    // gcTime: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
