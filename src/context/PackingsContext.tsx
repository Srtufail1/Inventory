'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type PackingsContextType = {
  packings: string[];
  loading: boolean;
};

const PackingsContext = createContext<PackingsContextType | null>(null);

export const PackingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [packings, setPackings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPackings = async () => {
      try {
        const res = await fetch('/api/packings');
        const data = await res.json();

        if (!cancelled && Array.isArray(data)) {
          setPackings(
            data.map((p: any) => p.packing || '').filter(Boolean)
          );
        }
      } catch (err) {
        console.error('Failed to fetch packings', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPackings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PackingsContext.Provider value={{ packings, loading }}>
      {children}
    </PackingsContext.Provider>
  );
};

export const usePackings = () => {
  const context = useContext(PackingsContext);
  if (!context) {
    throw new Error('usePackings must be used inside PackingsProvider');
  }
  return context;
};
