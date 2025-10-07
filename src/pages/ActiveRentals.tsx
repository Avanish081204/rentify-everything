import { useActiveRentals } from '@/hooks/useActiveRentals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ActiveRentals() {
  const { activeRentals, updateRentalStatus } = useActiveRentals();

  const handleComplete = (id: string) => {
    updateRentalStatus(id, 'completed');
    toast.success('Rental marked as completed');
  };

  const handleCancel = (id: string) => {
    updateRentalStatus(id, 'cancelled');
    toast.success('Rental cancelled');
  };

  const activeItems = activeRentals.filter(r => r.status === 'active');
  const completedItems = activeRentals.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Active Rentals</h1>
          <p className="text-muted-foreground">
            {activeItems.length} active rental{activeItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {activeItems.length > 0 ? (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold">Current Rentals</h2>
            <div className="grid gap-6">
              {activeItems.map((rental) => (
                <Card key={rental.id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={rental.item.imageUrl}
                      alt={rental.item.title}
                      className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{rental.item.title}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{rental.item.location}</span>
                          </div>
                        </div>
                        <Badge variant={rental.isPurchase ? 'default' : 'secondary'} className="gap-1">
                          {rental.isPurchase ? (
                            <>
                              <ShoppingBag className="h-3 w-3" />
                              Purchased
                            </>
                          ) : (
                            <>
                              <Package className="h-3 w-3" />
                              Rented
                            </>
                          )}
                        </Badge>
                      </div>

                      {!rental.isPurchase && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>From: {new Date(rental.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>To: {new Date(rental.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-2xl font-bold text-primary">
                          ${rental.totalPrice.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleCancel(rental.id)}>
                            Cancel
                          </Button>
                          {!rental.isPurchase && (
                            <Button onClick={() => handleComplete(rental.id)}>
                              Complete Rental
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center mb-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No active rentals</h2>
            <p className="text-muted-foreground mb-6">
              Start browsing to rent or buy items
            </p>
            <Link to="/browse">
              <Button size="lg">Browse Items</Button>
            </Link>
          </Card>
        )}

        {completedItems.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Past Rentals</h2>
            <div className="grid gap-4">
              {completedItems.map((rental) => (
                <Card key={rental.id} className="p-4 opacity-60">
                  <div className="flex items-center gap-4">
                    <img
                      src={rental.item.imageUrl}
                      alt={rental.item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{rental.item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed • ${rental.totalPrice}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
