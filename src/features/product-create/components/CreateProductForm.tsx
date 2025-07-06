import React, { useState } from 'react';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useCategories } from '../hooks/useCategories';
import { CreateProductRequest } from '../../../shared/types/product';

export const CreateProductForm: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateProductRequest>({
    title: '',
    price: 0,
    description: '',
    category: '',
    image: '',
  });

  const createProductMutation = useCreateProduct();
  // Only fetch categories when the form is visible
  const { data: categories, isLoading: categoriesLoading } = useCategories(isFormVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProductMutation.mutateAsync(formData);
      // Reset form on success
      setFormData({
        title: '',
        price: 0,
        description: '',
        category: '',
        image: '',
      });
      setIsFormVisible(false);
    } catch (error) {
      // Error is already handled in the mutation hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isFormVisible) {
    return (
      <div className="create-product-toggle">
        <button
          onClick={() => setIsFormVisible(true)}
          className="create-product-btn"
        >
          + Create New Product
        </button>
      </div>
    );
  }

  return (
    <div className="create-product-form">
      <div className="form-header">
        <h3>Create New Product</h3>
        <button
          onClick={() => setIsFormVisible(false)}
          className="close-btn"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'Select category'}
            </option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setIsFormVisible(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProductMutation.isPending}
            className="submit-btn"
          >
            {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>

      {createProductMutation.isError && (
        <div className="error-message">
          Error: {createProductMutation.error?.message}
        </div>
      )}

      {createProductMutation.isSuccess && (
        <div className="success-message">
          Product created successfully!
          <small>Note: This is a demo API, so the product won't actually be saved.</small>
        </div>
      )}
    </div>
  );
};
