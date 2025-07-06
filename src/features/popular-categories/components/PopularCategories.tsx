import React from 'react';
import { usePopularCategories } from '../hooks/usePopularCategories';

export const PopularCategories: React.FC = () => {
  const { data: categories, isLoading, error, refetch, isFetching } = usePopularCategories();

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) return <div className="popular-categories">Loading categories...</div>;
  if (error) return <div className="popular-categories">Error loading categories</div>;

  return (
    <div className="popular-categories">
      <h3>Famous Categories</h3>
      <div className="categories-list">
        {categories?.map((category: string) => (
          <span key={category} className="category-tag">
            {category}
          </span>
        ))}
        <button 
          onClick={handleRefetch}
          disabled={isFetching}
          className="refetch-btn"
          title="Refresh categories"
        >
          {isFetching ? '↻' : '⟲'}
        </button>
      </div>
    </div>
  );
}; 