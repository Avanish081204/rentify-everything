import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { RentalCard } from '@/components/RentalCard';
import { mockRentals } from '@/data/mockRentals';
import { SearchFilters, RentalItem } from '@/types/rental';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: (searchParams.get('category') as any) || undefined,
    sortBy: 'featured',
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>(mockRentals);

  useEffect(() => {
    let items = [...mockRentals];

    // Apply category filter
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }

    // Apply search query
    if (searchQuery) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        items.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case 'featured':
      default:
        items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredItems(items);
  }, [filters, searchQuery]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category) params.set('category', filters.category);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Search Bar */}
        <div className="bg-card rounded-xl p-4 card-shadow mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value === 'all' ? undefined : value as any })
              }
            >
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="property">Properties</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
            <Button size="lg" className="h-12 gap-2" onClick={handleSearch}>
              <Search className="h-5 w-5" />
              Search
            </Button>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="delivery" />
                        <label htmlFor="delivery" className="text-sm">Free Delivery</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="insurance" />
                        <label htmlFor="insurance" className="text-sm">Insurance Included</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="instant" />
                        <label htmlFor="instant" className="text-sm">Instant Booking</label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <div className="space-y-2">
                      {['new', 'excellent', 'good', 'fair'].map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox id={condition} />
                          <label htmlFor={condition} className="text-sm capitalize">{condition}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-sm text-muted-foreground">
              {filteredItems.length} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
          {filteredItems.map((item) => (
            <RentalCard key={item.id} item={item} />
          ))}
        </div>

        {/* Pagination */}
        {filteredItems.length > 0 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline">Previous</Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
