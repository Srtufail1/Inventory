import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FormInput from "../FormInput";
import { addUpdateOutward } from "@/actions/user";
import { toast } from "../ui/use-toast";
import { useCustomers } from '@/context/CustomersContext';

type Props = {
  title: string;
  data: any;
};

const OutwardData = ({ title, data }: Props) => {
  const { customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState(data?.customer || '');
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inwardNumber, setInwardNumber] = useState(data?.inumber || '');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [itemValue, setItemValue] = useState(data?.item || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      if (!searchTerm || loading || hasSelected) {
        setFilteredCustomers([]);
        return;
      }
      const filtered = customers.filter(customer =>
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

  // Auto-fill customer name and item when inward number changes
  const lookupInwardNumber = useCallback(async (inumber: string) => {
    if (!inumber.trim()) return;

    setIsAutoFilling(true);
    try {
      const response = await fetch(`/api/inward-lookup?inumber=${encodeURIComponent(inumber)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.customer) {
          setSearchTerm(result.customer);
          setHasSelected(true);
        }
        if (result.item) {
          setItemValue(result.item);
        }
      }
    } catch (error) {
      console.error('Error looking up inward number:', error);
    } finally {
      setIsAutoFilling(false);
    }
  }, []);

  const handleInwardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInwardNumber(value);

    // Debounce the lookup to avoid too many API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only auto-fill for new entries (not updates)
    if (!data?.id && value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        lookupInwardNumber(value);
      }, 500);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set('customer', searchTerm);
    formData.set('inumber', inwardNumber);
    formData.set('item', itemValue);
    const response: any = await addUpdateOutward(formData, data);
    if (response?.error) {
      toast({ title: response?.error, variant: "destructive" });
    } else {
      toast({ title: "Inventory created successfully" });
      setIsOpen(false); // Only close on success
    }
    setIsSubmitting(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening for new entries
      setInwardNumber(data?.inumber || '');
      setSearchTerm(data?.customer || '');
      setItemValue(data?.item || '');
      if (searchRef.current) {
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">{title}</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Make changes here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mt-5">
              <div className="flex flex-col gap-5">
                <div className="mb-4">
                  <Label htmlFor="inumber" className="mb-2 text-sm font-medium text-foreground">
                    Enter Inward Number
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      name="inumber"
                      value={inwardNumber}
                      onChange={handleInwardNumberChange}
                      placeholder="Enter inward number"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-ring"
                    />
                    {isAutoFilling && (
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                        Looking up...
                      </span>
                    )}
                  </div>
                </div>
                <FormInput
                  type="number"
                  name="onumber"
                  label="Enter Outward Number"
                  defaultValue={data?.onumber}
                />
                <div className="flex flex-col space-y-2 relative">
                  <Label htmlFor="customer">Enter customer name</Label>
                  <Input
                    ref={searchRef}
                    type="text"
                    name="customer"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Search for a customer"
                    className="mt-2"
                  />
                  {isAutoFilling && (
                    <p className="text-xs text-blue-600">Auto-filling from inward record...</p>
                  )}
                  {filteredCustomers.length > 0 && (
                    <ul className="z-10 w-full bg-popover border mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
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
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="outDate">Out Date</Label>
                  <Input
                    type="date"
                    id="outDate"
                    name="outDate"
                    defaultValue={data?.outDate ? new Date(data.outDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="item" className="mb-2 text-sm font-medium text-foreground">
                    Enter item
                  </Label>
                  <Input
                    type="text"
                    name="item"
                    value={itemValue}
                    onChange={(e) => setItemValue(e.target.value)}
                    placeholder="Enter item"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-ring"
                  />
                </div>
                <FormInput
                  type="number"
                  name="quantity"
                  label="Enter quantity"
                  defaultValue={data?.quantity}
                />
              </div>
            </div>
            <Button type="submit" className="mt-5" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : title}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OutwardData;