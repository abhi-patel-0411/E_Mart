import React from 'react';

const OfferBadge = ({ offer, className = '' }) => {
  const getBadgeStyle = (offerType) => {
    const baseStyle = "inline-block px-2 py-1 text-xs font-bold rounded-full text-white";
    
    switch (offerType) {
      case 'discount':
        return `${baseStyle} bg-red-500`;
      case 'flat':
        return `${baseStyle} bg-green-500`;
      case 'bogo':
        return `${baseStyle} bg-purple-500`;
      case 'buy_x_get_y':
        return `${baseStyle} bg-blue-500`;
      case 'combo':
        return `${baseStyle} bg-orange-500`;
      case 'category_offer':
        return `${baseStyle} bg-pink-500`;
      case 'first_time':
        return `${baseStyle} bg-yellow-500 text-black`;
      default:
        return `${baseStyle} bg-gray-500`;
    }
  };

  if (!offer) return null;

  return (
    <span className={`${getBadgeStyle(offer.offer_type)} ${className}`}>
      {offer.badge_text || offer.name}
    </span>
  );
};

export default OfferBadge;