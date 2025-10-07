import { RentalItem } from '@/types/rental';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface RentalCardProps {
  item: RentalItem;
}

export const RentalCard = ({ item }: RentalCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item.id);

  const handleFavoriteClick = () => {
    toggleFavorite(item.id);
    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
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
            <span>{item.distance} mi</span>
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
            <span className="text-2xl font-bold text-primary">${item.price}</span>
            <span className="text-sm text-muted-foreground">/{item.duration}</span>
          </div>
          <Button>Book Now</Button>
        </div>
      </div>
    </Card>
  );
};
