export type RentalCategory = 'property' | 'vehicle' | 'equipment' | 'electronics';

export type RentalDuration = 'hourly' | 'daily' | 'weekly' | 'monthly';

export type RentalCondition = 'new' | 'excellent' | 'good' | 'fair';

export interface RentalItem {
  id: string;
  title: string;
  description: string;
  category: RentalCategory;
  subcategory: string;
  price: number;
  duration: RentalDuration;
  location: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  condition: RentalCondition;
  features: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  availableFrom: string;
  freeDelivery?: boolean;
  insurance?: boolean;
  instantBooking?: boolean;
  isFeatured?: boolean;
}

export interface SearchFilters {
  category?: RentalCategory;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  duration?: RentalDuration;
  condition?: RentalCondition[];
  minRating?: number;
  freeDelivery?: boolean;
  insurance?: boolean;
  instantBooking?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'distance' | 'newest';
}
