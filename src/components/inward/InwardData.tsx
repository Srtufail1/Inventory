import React, { useState, useEffect, useRef } from "react";
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
import { addUpdateInward } from "@/actions/user";
import { toast } from "../ui/use-toast";
import { useCustomers } from '@/context/CustomersContext';
import { useItems } from '@/context/ItemsContext';

type Props = {
  title: string;
  data: any;
};

const InwardData = ({ title, data }: Props) => {
  const { customers, loading } = useCustomers();
  const { items: allItems, loading: itemsLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState(data?.customer || '');
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Item autocomplete state
  const [itemTerm, setItemTerm] = useState(data?.item || '');
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [hasSelectedItem, setHasSelectedItem] = useState(false);

  // Filter customers
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

  // Filter items
  useEffect(() => {
    if (!itemTerm || itemsLoading || hasSelectedItem) {
      setFilteredItems([]);
      return;
    }
    const filtered = allItems.filter(item =>
      item.toLowerCase().includes(itemTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [itemTerm, allItems, itemsLoading, hasSelectedItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasSelected(false);
  };

  const handleCustomerSelect = (customer: string) => {
    setSearchTerm(customer);
    setHasSelected(true);
    setFilteredCustomers([]);
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemTerm(e.target.value);
    setHasSelectedItem(false);
  };

  const handleItemSelect = (item: string) => {
    setItemTerm(item);
    setHasSelectedItem(true);
    setFilteredItems([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set('customer', searchTerm);
    formData.set('item', itemTerm);
    const response: any = await addUpdateInward(formData, data);
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
      setItemTerm(data?.item || '');
      setSearchTerm(data?.customer || '');
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
                <FormInput
                  type="number"
                  name="inumber"
                  label="Inward Number"
                  placeholder="Enter the number"
                  defaultValue={data?.inumber}
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
                  <Label htmlFor="addDate">Add In Date</Label>
                  <Input
                    type="date"
                    id="addDate"
                    name="addDate"
                    defaultValue={data?.addDate ? new Date(data.addDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                {/* Item field with autocomplete */}
                <div className="flex flex-col space-y-2 relative">
                  <Label htmlFor="item">Enter item</Label>
                  <Input
                    type="text"
                    name="item"
                    value={itemTerm}
                    onChange={handleItemInputChange}
                    placeholder="Search for an item"
                    className="mt-2"
                  />
                  {filteredItems.length > 0 && (
                    <ul className="z-10 w-full bg-popover border mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                      {filteredItems.map((item, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-popover-foreground"
                          onClick={() => handleItemSelect(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <FormInput
                  type="text"
                  name="packing"
                  label="Enter packing type"
                  defaultValue={data?.packing}
                />
                <FormInput
                  type="number"
                  name="weight"
                  label="Enter Weight (Kg)"
                  defaultValue={data?.weight}
                />
                <FormInput
                  type="number"
                  name="quantity"
                  label="Enter quantity"
                  defaultValue={data?.quantity}
                />
                <FormInput
                  type="number"
                  name="store_rate"
                  label="Enter store rate (Rs.)"
                  defaultValue={data?.store_rate}
                />
                <FormInput
                  type="number"
                  name="labour_rate"
                  label="Enter labour rate (Rs.)"
                  defaultValue={data?.labour_rate}
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

export default InwardData;