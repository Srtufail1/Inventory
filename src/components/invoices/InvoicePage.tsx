"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DarkModeToggle from '../DarkModeToggle';
import { signOut } from "next-auth/react";
import { useCustomers } from '@/context/CustomersContext';

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  billingPeriod: string;
  totalAmount: number;
  createdAt: string;
};

const InvoicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedCustomer, setSearchedCustomer] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { customers, loading } = useCustomers();
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    if (!searchTerm || loading || hasSelected) {
      setFilteredCustomers([]);
      return;
    }
    const filtered = customers.filter(c =>
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers, loading, hasSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasSelected(false);
  };

  const handleCustomerSelect = (customer: string) => {
    setSearchTerm(customer);
    setHasSelected(true);
    setFilteredCustomers([]);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setHasSearched(false);

    try {
      const res = await fetch(`/api/invoices?customer=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
      setSearchedCustomer(searchTerm);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full"></div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        </div>
      </div>

      <main className="max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customer Invoices
          </h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer name..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 py-2 w-full"
              />
              {filteredCustomers.length > 0 && (
                <ul className="absolute z-10 w-full bg-popover border mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                  {filteredCustomers.map((customer, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-muted cursor-pointer text-popover-foreground"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {customer}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchTerm.trim()}
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search Invoices'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Invoices for: {searchedCustomer}
                <span className="ml-3 text-sm font-normal text-muted-foreground">
                  ({invoices.length} record{invoices.length !== 1 ? 's' : ''})
                </span>
              </h2>
            </div>

            {invoices.length > 0 ? (
              <div className="bg-card shadow rounded-lg overflow-hidden border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Invoice No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Invoice Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Billing Period
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount (PKR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((invoice, index) => (
                        <tr
                          key={invoice.id}
                          className={index % 2 === 0 ? 'bg-muted/30' : ''}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {invoice.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(invoice.invoiceDate)}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {invoice.billingPeriod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right font-medium">
                            {invoice.totalAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-bold">
                        <td colSpan={4} className="px-6 py-3 text-sm text-foreground text-right">
                          Total Billed:
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground text-right">
                          {invoices
                            .reduce((sum, inv) => sum + inv.totalAmount, 0)
                            .toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground mt-8">
                No invoices found for {searchedCustomer}.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InvoicePage;
