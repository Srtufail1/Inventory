import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FormInput from "../FormInput";
import { addUpdateOutward } from "@/actions/user";
import { toast } from "../ui/use-toast";

type Props = {
  title: string;
  data: any;
};

const OutwardData = ({ title, data }: Props) => {
  const [customers, setCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(data?.customer || '');
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data.map((customer: any) => customer.customer || customer.name || ''));
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('customer', searchTerm);
    const response: any = await addUpdateOutward(formData, data);
    if (response?.error) {
      toast({ title: response?.error });
    } else {
      toast({ title: "Inventory created successfully" });
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 0);
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
                <FormInput
                  type="number"
                  name="inumber"
                  label="Enter Inward Number"
                  defaultValue={data?.inumber}
                />
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a customer"
                    className="mt-2"
                  />
                  {filteredCustomers.length > 0 && (
                    <ul className="z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                      {filteredCustomers.map((customer, index) => (
                        <li 
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSearchTerm(customer);
                            setFilteredCustomers([]);
                          }}
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
                <FormInput
                  type="text"
                  name="item"
                  label="Enter item"
                  defaultValue={data?.item}
                />
                <FormInput
                  type="number"
                  name="quantity"
                  label="Enter quantity"
                  defaultValue={data?.quantity}
                />
              </div>
            </div>
            <SheetClose>
              <Button type="submit" className="mt-5">
                {title}
              </Button>
            </SheetClose>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OutwardData;