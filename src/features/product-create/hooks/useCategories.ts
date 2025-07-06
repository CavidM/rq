import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';

export const useCategories = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.products.getCategories,

    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    enabled, // Only fetch when enabled
  });
};
