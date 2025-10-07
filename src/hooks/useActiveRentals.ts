import { useState, useEffect } from 'react';
import { ActiveRental } from '@/types/rental';

export function useActiveRentals() {
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('rentify_active_rentals');
    if (stored) {
      setActiveRentals(JSON.parse(stored));
    }
  }, []);

  const addRental = (rental: ActiveRental) => {
    setActiveRentals(prev => {
      const newRentals = [...prev, rental];
      localStorage.setItem('rentify_active_rentals', JSON.stringify(newRentals));
      return newRentals;
    });
  };

  const removeRental = (id: string) => {
    setActiveRentals(prev => {
      const newRentals = prev.filter(r => r.id !== id);
      localStorage.setItem('rentify_active_rentals', JSON.stringify(newRentals));
      return newRentals;
    });
  };

  const updateRentalStatus = (id: string, status: ActiveRental['status']) => {
    setActiveRentals(prev => {
      const newRentals = prev.map(r => r.id === id ? { ...r, status } : r);
      localStorage.setItem('rentify_active_rentals', JSON.stringify(newRentals));
      return newRentals;
    });
  };

  return { 
    activeRentals, 
    addRental, 
    removeRental, 
    updateRentalStatus,
    activeCount: activeRentals.filter(r => r.status === 'active').length
  };
}
