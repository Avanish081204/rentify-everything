import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useActiveRentals } from '@/hooks/useActiveRentals';
import { mockRentals } from '@/data/mockRentals';
import { RentalCard } from '@/components/RentalCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Package, User } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { activeCount } = useActiveRentals();
  
  const favoriteItems = mockRentals.filter(item => favorites.includes(item.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your rentals and favorites</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{favorites.length}</p>
                <p className="text-sm text-muted-foreground">Saved Items</p>
              </div>
            </div>
          </Card>

          <Link to="/active-rentals">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active Rentals</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Your Account</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Favorites</h2>
          <Link to="/favorites">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {favoriteItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteItems.slice(0, 4).map((item) => (
              <RentalCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">Start exploring and save items you like</p>
            <Link to="/browse">
              <Button>Browse Rentals</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
