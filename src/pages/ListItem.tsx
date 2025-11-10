import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ListItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    purchase_price: '',
    duration: 'daily',
    location: '',
    condition: 'good',
    features: '',
    free_delivery: false,
    insurance: false,
    instant_booking: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to list an item",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('rental-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('rental-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
        setUploading(false);
      }

      const featuresArray = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { error } = await supabase
        .from('rental_listings')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          price: parseFloat(formData.price),
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          duration: formData.duration,
          location: formData.location,
          condition: formData.condition,
          features: featuresArray,
          image_url: imageUrl,
          free_delivery: formData.free_delivery,
          insurance: formData.insurance,
          instant_booking: formData.instant_booking,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been listed",
      });

      navigate('/my-listings');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>List Your Item for Rent</CardTitle>
          <CardDescription>Fill in the details to list your item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g., Apartment, Car, Camera"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Rental Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (₹) (Optional)</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="e.g., WiFi, Air Conditioning, GPS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Upload Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="free_delivery">Free Delivery</Label>
                <Switch
                  id="free_delivery"
                  checked={formData.free_delivery}
                  onCheckedChange={(checked) => setFormData({ ...formData, free_delivery: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="insurance">Insurance Available</Label>
                <Switch
                  id="insurance"
                  checked={formData.insurance}
                  onCheckedChange={(checked) => setFormData({ ...formData, insurance: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="instant_booking">Instant Booking</Label>
                <Switch
                  id="instant_booking"
                  checked={formData.instant_booking}
                  onCheckedChange={(checked) => setFormData({ ...formData, instant_booking: checked })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading image...' : 'Listing...'}
                </>
              ) : (
                'List Item'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}