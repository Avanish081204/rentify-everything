import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Search, Building2, Car, Wrench, Heart, LayoutDashboard, LogOut, Package, PlusCircle, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveRentals } from '@/hooks/useActiveRentals';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { activeCount } = useActiveRentals();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse', icon: Search },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/vehicles', label: 'Vehicles', icon: Car },
    { path: '/equipment', label: 'Equipment', icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-2xl font-bold text-foreground">Rentify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? 'default' : 'ghost'}
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/favorites">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/list-item">
                <Button variant="default" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  List Item
                </Button>
              </Link>
              <Link to="/my-listings">
                <Button variant="ghost" size="icon">
                  <ListChecks className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/active-rentals">
                <Button variant="ghost" size="icon" className="relative">
                  <Package className="h-5 w-5" />
                  {activeCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActive(link.path) ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t space-y-2">
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/list-item" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full justify-start gap-2">
                      <PlusCircle className="h-4 w-4" />
                      List Item
                    </Button>
                  </Link>
                  <Link to="/my-listings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <ListChecks className="h-4 w-4" />
                      My Listings
                    </Button>
                  </Link>
                  <Link to="/active-rentals" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Package className="h-4 w-4" />
                      Active Rentals
                      {activeCount > 0 && (
                        <Badge className="ml-auto">{activeCount}</Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
