import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Calendar, User, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

interface RentalItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  duration: string;
  location: string;
  condition: string;
  image_url: string | null;
  status: string;
  created_at: string;
  user_id: string;
  features: string[];
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  created_at: string;
  rental_items: {
    title: string;
    image_url: string | null;
  } | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [pendingItems, setPendingItems] = useState<RentalItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/signin');
      return;
    }

    if (!adminLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, adminLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending rental listings
      const { data: items, error: itemsError } = await supabase
        .from('rental_listings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch all rentals
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .order('created_at', { ascending: false });

      if (rentalsError) throw rentalsError;

      // Fetch owner profiles for items
      const ownerIds = items?.map(item => item.user_id) || [];
      const { data: ownerProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ownerIds);

      // Fetch renter profiles for rentals
      const renterIds = rentalsData?.map(rental => rental.renter_id) || [];
      const { data: renterProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', renterIds);

      // Fetch rental items for rentals
      const itemIds = rentalsData?.map(rental => rental.item_id) || [];
      const { data: rentalItemsData } = await supabase
        .from('rental_items')
        .select('id, title, image_url')
        .in('id', itemIds);

      // Map profiles to items
      const itemsWithDetails = items?.map(item => ({
        ...item,
        profiles: ownerProfiles?.find(p => p.id === item.user_id) || null,
      })) || [];

      // Map profiles and items to rentals
      const rentalsWithDetails = rentalsData?.map(rental => ({
        ...rental,
        profiles: renterProfiles?.find(p => p.id === rental.renter_id) || null,
        rental_items: rentalItemsData?.find(i => i.id === rental.item_id) || null
      })) || [];

      setPendingItems(itemsWithDetails);
      setRentals(rentalsWithDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const { error } = await supabase
        .from('rental_listings')
        .update({ status: 'approved' })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item approved successfully');
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const { error } = await supabase
        .from('rental_listings')
        .update({ status: 'rejected' })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item rejected');
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    } finally {
      setActionLoading(null);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage rental items and view all transactions</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pending Items
            {pendingItems.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingItems.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rentals">All Rentals</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending items to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">₹{item.price}</span>
                        <span className="text-muted-foreground">/ {item.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{item.profiles?.full_name || item.profiles?.email || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Location:</span> {item.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading === item.id}
                        className="flex-1 gap-2"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(item.id)}
                        disabled={actionLoading === item.id}
                        variant="destructive"
                        className="flex-1 gap-2"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rentals" className="mt-6">
          {rentals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rentals found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rentals.map((rental) => (
                <Card key={rental.id}>
                  <CardContent className="flex items-center gap-4 p-6">
                    {rental.rental_items?.image_url && (
                      <div className="h-20 w-20 overflow-hidden rounded-lg flex-shrink-0">
                        <img
                          src={rental.rental_items.image_url}
                          alt={rental.rental_items.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {rental.rental_items?.title || 'Item Unavailable'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Rented by: {rental.profiles?.full_name || rental.profiles?.email || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-foreground">${rental.total_cost}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        rental.status === 'active' ? 'default' :
                        rental.status === 'completed' ? 'secondary' :
                        rental.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {rental.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
