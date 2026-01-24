'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type CustomersContextType = {
  customers: string[];
  loading: boolean;
};

const CustomersContext = createContext<CustomersContextType | null>(null);

export const CustomersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customers, setCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();

        if (!cancelled) {
          setCustomers(
            data.map((c: any) => c.customer || c.name || '')
          );
        }
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, loading }}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used inside CustomersProvider');
  }
  return context;
};
