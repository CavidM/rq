import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll,
    gcTime: 0
  });
};
