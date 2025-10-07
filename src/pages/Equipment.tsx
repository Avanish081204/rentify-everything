import { useState } from 'react';
import { RentalCard } from '@/components/RentalCard';
import { mockRentals } from '@/data/mockRentals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Equipment() {
  const [sortBy, setSortBy] = useState('featured');
  const equipment = mockRentals.filter(item => item.category === 'equipment' || item.category === 'electronics');

  const sortedEquipment = [...equipment].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Equipment & Electronics</h1>
          <p className="text-xl text-muted-foreground">
            Professional equipment and electronics for every need
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">{sortedEquipment.length} items available</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedEquipment.map(item => (
            <RentalCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
