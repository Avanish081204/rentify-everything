import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Building2, Car, Wrench, Laptop, Shield, Clock, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RentalCard } from '@/components/RentalCard';
import { featuredRentals } from '@/data/mockRentals';
import heroImage from '@/assets/hero-rentify.jpg';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    navigate(`/browse?${params.toString()}`);
  };

  const categories = [
    { value: 'property', label: 'Properties', icon: Building2 },
    { value: 'vehicle', label: 'Vehicles', icon: Car },
    { value: 'equipment', label: 'Equipment', icon: Wrench },
    { value: 'electronics', label: 'Electronics', icon: Laptop },
  ];

  const stats = [
    { label: 'Active Listings', value: '10,000+' },
    { label: 'Happy Customers', value: '50,000+' },
    { label: 'Cities Covered', value: '50+' },
    { label: 'Average Rating', value: '4.8/5' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Rentify Hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Rent Anything, Anywhere
            </h1>
            <p className="text-xl text-white/90">
              From properties and vehicles to equipment and electronics - find what you need, when you need it.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="lg" className="h-12 gap-2" onClick={handleSearch}>
                  <Search className="h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const pathMap: Record<string, string> = {
                property: '/properties',
                vehicle: '/vehicles',
                equipment: '/equipment',
                electronics: '/equipment'
              };
              return (
                <button
                  key={cat.value}
                  onClick={() => navigate(pathMap[cat.value] || '/browse')}
                  className="p-6 bg-card rounded-xl card-shadow hover:card-shadow-hover transition-smooth text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                    <cat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">{cat.label}</h3>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Rentals</h2>
            <Button variant="outline" onClick={() => navigate('/browse')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRentals.map((item) => (
              <RentalCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How Rentify Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Search & Browse</h3>
              <p className="text-muted-foreground">
                Find exactly what you need from thousands of listings across multiple categories.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Book Instantly</h3>
              <p className="text-muted-foreground">
                Reserve your rental with just a few clicks. Secure payment and instant confirmation.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Enjoy & Return</h3>
              <p className="text-muted-foreground">
                Use your rental and return it when you're done. Rate your experience to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Your Safety is Our Priority</h2>
            <p className="text-lg opacity-90">
              Every rental on Rentify is verified, insured, and backed by our 24/7 customer support team.
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6" />
                <span>Trusted Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
