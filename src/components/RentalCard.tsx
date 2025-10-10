import { RentalItem } from '@/types/rental';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useActiveRentals } from '@/hooks/useActiveRentals';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RentalCardProps {
  item: RentalItem;
}

export const RentalCard = ({ item }: RentalCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRental } = useActiveRentals();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const favorited = isFavorite(item.id);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingType, setBookingType] = useState<'rent' | 'buy'>('rent');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFavoriteClick = () => {
    toggleFavorite(item.id);
    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookNow = (type: 'rent' | 'buy') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to rent or buy items');
      navigate('/auth/signin');
      return;
    }
    setBookingType(type);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    const rental = {
      id: `rental-${Date.now()}`,
      rentalItemId: item.id,
      item,
      startDate: bookingType === 'rent' ? startDate : new Date().toISOString(),
      endDate: bookingType === 'rent' ? endDate : new Date().toISOString(),
      totalPrice: bookingType === 'buy' ? (item.purchasePrice || 0) : item.price,
      isPurchase: bookingType === 'buy',
      status: 'active' as const,
    };
    
    addRental(rental);
    setShowBooking(false);
    toast.success(bookingType === 'buy' ? 'Purchase confirmed!' : 'Rental booked successfully!');
  };

  return (
    <Card className="overflow-hidden card-shadow hover:card-shadow-hover transition-smooth group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 rounded-full"
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-current text-red-500' : ''}`} />
        </Button>
        {item.isFeatured && (
          <Badge className="absolute top-3 left-3 bg-secondary">Featured</Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <Badge variant="outline" className="shrink-0">
            {item.condition}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{item.location}</span>
          </div>
          {item.distance && (
            <span>{item.distance} km</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-amber-400" />
          <span className="font-medium">{item.rating}</span>
          <span className="text-sm text-muted-foreground">({item.reviewCount})</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {item.features.slice(0, 3).map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <span className="text-2xl font-bold text-primary">₹{item.price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-muted-foreground">/{item.duration}</span>
            {item.purchasePrice && (
              <div className="text-xs text-muted-foreground">
                or ₹{item.purchasePrice.toLocaleString('en-IN')} to buy
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleBookNow('rent')}>Rent</Button>
            {item.purchasePrice && (
              <Button variant="outline" onClick={() => handleBookNow('buy')} className="gap-1">
                <ShoppingBag className="h-4 w-4" />
                Buy
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingType === 'buy' ? 'Purchase' : 'Rent'} {item.title}
            </DialogTitle>
            <DialogDescription>
              {bookingType === 'buy' 
                ? `Purchase this item for ₹${item.purchasePrice?.toLocaleString('en-IN')}`
                : 'Select your rental dates'}
            </DialogDescription>
          </DialogHeader>

          {bookingType === 'rent' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold">Rental Price</p>
                <p className="text-2xl font-bold text-primary">₹{item.price.toLocaleString('en-IN')}/{item.duration}</p>
              </div>
            </div>
          )}

          {bookingType === 'buy' && (
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="text-sm font-semibold">Purchase Price</p>
              <p className="text-2xl font-bold text-primary">₹{item.purchasePrice?.toLocaleString('en-IN')}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBooking(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmBooking}
              disabled={bookingType === 'rent' && (!startDate || !endDate)}
            >
              Confirm {bookingType === 'buy' ? 'Purchase' : 'Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
