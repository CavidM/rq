import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import { getPopularCategories } from '../utils/categoryUtils';

export const usePopularCategories = () => {
  const query = useQuery({
    queryKey: ['popular-categories'],
    queryFn: api.products.getAll,
    select: (products) => getPopularCategories(products),
    // staleTime: 5 * 60 * 1000 // 5 minutes
    // gcTime: 0
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};
