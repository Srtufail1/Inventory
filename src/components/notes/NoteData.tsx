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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormInput from "../FormInput";
import { addUpdateNote } from "@/actions/note";
import { toast } from "../ui/use-toast";
import { useCustomers } from "@/context/CustomersContext";

type Props = {
  title: string;
  data: any;
};

const NOTE_TYPES = [
  { value: "old_inward", label: "Old Inward Record" },
  { value: "old_outward", label: "Old Outward Record" },
  { value: "general", label: "General Note" },
  { value: "memo", label: "Memo" },
];

const NoteData = ({ title, data }: Props) => {
  const { customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState(data?.customer || "");
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [noteType, setNoteType] = useState(data?.type || "general");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("customer", searchTerm);
    formData.set("type", noteType);
    const response: any = await addUpdateNote(formData, data);
    if (response?.error) {
      toast({ title: response?.error, variant: "destructive" });
    } else {
      toast({ title: data?.id ? "Note updated successfully" : "Note created successfully" });
      setIsOpen(false);
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSearchTerm(data?.customer || "");
      setNoteType(data?.type || "general");
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
            {data?.id
              ? "Update this note. Click save when you are done."
              : "Add a new note or archive record. Click save when done."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mt-5">
              <div className="flex flex-col gap-5">
                {/* Type selector */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="type">Record Type *</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {NOTE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <FormInput
                  type="text"
                  name="title"
                  label="Title *"
                  placeholder="Enter a title or reference"
                  defaultValue={data?.title}
                />

                {/* Description */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="description">Description / Remarks *</Label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    defaultValue={data?.description}
                    placeholder="Enter details, page references, remarks etc."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Customer (optional) */}
                <div className="flex flex-col space-y-2 relative">
                  <Label htmlFor="customer">Customer (optional)</Label>
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
                    <ul className="z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                      {filteredCustomers.map((customer, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          {customer}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Inward Number (optional) */}
                <FormInput
                  type="text"
                  name="inumber"
                  label="Inward Number (optional)"
                  placeholder="Enter inward number if applicable"
                  defaultValue={data?.inumber}
                />

                {/* Item (optional) */}
                <FormInput
                  type="text"
                  name="item"
                  label="Item (optional)"
                  placeholder="Enter item name"
                  defaultValue={data?.item}
                />

                {/* Quantity (optional) */}
                <FormInput
                  type="text"
                  name="quantity"
                  label="Quantity (optional)"
                  placeholder="Enter quantity"
                  defaultValue={data?.quantity}
                />

                {/* Date (optional) */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="date">Date (optional)</Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={
                      data?.date
                        ? new Date(data.date).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
            <SheetClose>
              <Button type="submit" className="mt-5">
                {data?.id ? "Update Note" : "Save Note"}
              </Button>
            </SheetClose>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NoteData;