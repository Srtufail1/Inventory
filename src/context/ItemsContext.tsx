'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ItemsContextType = {
  items: string[];
  loading: boolean;
};

const ItemsContext = createContext<ItemsContextType | null>(null);

export const ItemsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();

        if (!cancelled && Array.isArray(data)) {
          setItems(
            data.map((i: any) => i.item || '').filter(Boolean)
          );
        }
      } catch (err) {
        console.error('Failed to fetch items', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ItemsContext.Provider value={{ items, loading }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used inside ItemsProvider');
  }
  return context;
};
