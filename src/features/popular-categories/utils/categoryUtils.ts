import { Product } from '../../../shared/types/product';

/**
 * Calculates category frequency from products array
 */
const calculateCategoryFrequency = (products: Product[]): Record<string, number> => {
  return products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Sorts categories by popularity (frequency) in descending order
 */
const sortCategoriesByPopularity = (categoryFrequency: Record<string, number>): string[] => {
  return Object.entries(categoryFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
};

/**
 * Gets popular categories from products array
 */
export const getPopularCategories = (products: Product[]): string[] => {
  const frequency = calculateCategoryFrequency(products);
  return sortCategoriesByPopularity(frequency);
}; 