import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../../shared/types/product';
import { CreateProductForm } from '../../product-create/components/CreateProductForm';

export const ProductSidebar: React.FC = () => {
  const { data: products, isLoading, error } = useProducts();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product-id');

  const handleProductClick = (id: number) => {
    navigate(`/?product-id=${id}`);
  };

  if (isLoading) return <div className="sidebar">Loading products...</div>;
  if (error) return <div className="sidebar">Error loading products</div>;

  return (
    <div className="sidebar">
      <CreateProductForm />
      <h3>Products</h3>
      <div className="products-list">
        {products?.map((product: Product) => (
          <div
            key={product.id}
            className={`product-item ${productId === product.id.toString() ? 'active' : ''}`}
            onClick={() => handleProductClick(product.id)}
          >
            <img src={product.image} alt={product.title} className="product-thumbnail" />
            <div className="product-info">
              <h4>{product.title}</h4>
              <p className="product-price">${product.price}</p>
              <p className="product-category">{product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 