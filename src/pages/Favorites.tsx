import { useFavorites } from '@/hooks/useFavorites';
import { mockRentals } from '@/data/mockRentals';
import { RentalCard } from '@/components/RentalCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const { favorites } = useFavorites();
  
  const favoriteItems = mockRentals.filter(item => favorites.includes(item.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {favoriteItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteItems.map((item) => (
              <RentalCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Click the heart icon on any rental to save it here
            </p>
            <Link to="/browse">
              <Button size="lg">Start Browsing</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
