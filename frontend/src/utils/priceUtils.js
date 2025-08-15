export const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00';
  const num = parseFloat(price);
  return num.toFixed(2);
};

export const formatCurrency = (price) => {
  return `₹${parseFloat(price).toFixed(0)}`;
};

// Calculate discounted price consistently
export const calculateDiscountedPrice = (price, discountPercentage) => {
  if (!price) return 0;
  if (!discountPercentage) return parseFloat(price);
  
  const basePrice = parseFloat(price);
  const discount = basePrice * (parseFloat(discountPercentage) / 100);
  return basePrice - discount;
};

// Get display price for a product
export const getDisplayPrice = (product) => {
  if (!product) return { currentPrice: 0, originalPrice: 0, hasDiscount: false, discountPercentage: 0 };
  
  const originalPrice = product.actual_price ? parseFloat(product.actual_price) : parseFloat(product.price);
  const currentPrice = parseFloat(product.price);
  const hasDiscount = product.discount_percentage > 0 && originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? parseFloat(product.discount_percentage) : 0;
  
  return { currentPrice, originalPrice, hasDiscount, discountPercentage };
};