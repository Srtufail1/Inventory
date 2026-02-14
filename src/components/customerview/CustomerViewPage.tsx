"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import { signOut } from "next-auth/react";
import { useCustomers } from "@/context/CustomersContext";
import ClientDashboard from "@/components/clientdashboard/ClientDashboard";

type InwardRecord = {
  id: string;
  inumber: string;
  addDate: string;
  customer: string;
  item: string;
  packing: string;
  weight: string;
  quantity: string;
  store_rate: string;
  labour_rate: string;
};

type OutwardRecord = {
  id: string;
  onumber: string;
  inumber: string;
  outDate: string;
  customer: string;
  item: string;
  quantity: string;
};

const CustomerViewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [inwardData, setInwardData] = useState<InwardRecord[]>([]);
  const [outwardData, setOutwardData] = useState<OutwardRecord[]>([]);
  const { customers, loading } = useCustomers();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchTerm || loading || hasSelected) {
      setFilteredCustomers([]);
      return;
    }
    const filtered = customers.filter((customer) =>
      customer.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (searchTerm.trim() === "") return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/customerview?customer=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setInwardData(result.inwardData);
      setOutwardData(result.outwardData);
      setSelectedCustomer(searchTerm);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-foreground">Customer View</span>
        </div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Customer View</h1>
        </div>

        {/* Search Section */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg max-w-xl">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customer
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Search for a customer to see their dashboard view (same view they
            see when they log in).
          </p>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Type customer name..."
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
              disabled={isLoading}
              className="w-full px-4 py-2"
            >
              {isLoading ? "Loading..." : "View Customer Dashboard"}
            </Button>
          </div>
        </div>

        {/* Customer Dashboard View */}
        {selectedCustomer && !isLoading && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-200 px-4 py-2">
              <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Viewing as customer: <strong>{selectedCustomer}</strong>
              </p>
            </div>
            <ClientDashboard
              userName={selectedCustomer}
              inwardData={inwardData}
              outwardData={outwardData}
            />
          </div>
        )}

        {/* No results */}
        {selectedCustomer &&
          !isLoading &&
          inwardData.length === 0 &&
          outwardData.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              No inward or outward records found for this customer.
            </p>
          )}
      </div>
    </div>
  );
};

export default CustomerViewPage;