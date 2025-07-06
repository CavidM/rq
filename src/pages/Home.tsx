import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PopularCategories } from '../features/popular-categories/components/PopularCategories';
import { ProductSidebar } from '../features/product-list/components/ProductSidebar';
import { ProductDetail } from '../features/product-details/components/ProductDetail';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product-id');

  return (
    <div className="home-layout">
      <PopularCategories />
      <div className="main-content">
        <ProductSidebar />
        <ProductDetail productId={productId ? parseInt(productId) : null} />
      </div>
    </div>
  );
}; 