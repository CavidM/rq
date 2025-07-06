import React from 'react';
import { useProduct } from '../hooks/useProduct';

interface ProductDetailProps {
  productId: number | null;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const { data: product, isLoading, error, fetchStatus, status } = useProduct(productId || 0);

  if (fetchStatus === 'paused' && !product) {
    return <div>📡 Offline - {'no data available'}</div>;
  }

  if (!productId) {
    return (
      <div className="product-detail">
        <div className="welcome-message">
          <h2>Welcome to our Product Store</h2>
          <p>Select a product from the sidebar to view details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="product-detail">Loading product details...</div>;
  if (error) return <div className="product-detail">Error loading product details</div>;
  if (!product) return <div className="product-detail">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-header">
        <img src={product.image} alt={product.title} className="product-image" />
        <div className="product-main-info">
          <h1>{product.title}</h1>
          <p className="product-price">${product.price}</p>
          <p className="product-category">Category: {product.category}</p>
          <div className="product-rating">
            <span>Rating: {product.rating.rate}/5</span>
            <span>({product.rating.count} reviews)</span>
          </div>
        </div>
      </div>
      <div className="product-description">
        <h3>Description</h3>
        <p>{product.description}</p>
      </div>
    </div>
  );
};
