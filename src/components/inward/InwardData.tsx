import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FormInput from "../FormInput";
import { addUpdateInward } from "@/actions/user";
import { toast } from "../ui/use-toast";

type Props = {
  title: string;
  data: any;
};
const InwardData = ({ title, data }: Props) => {
  const handleSubmit = async (formData: FormData) => {
    const response: any = await addUpdateInward(formData, data);
    if (response?.error) {
      toast({ title: response?.error });
    } else {
      toast({ title: "inventory created successfully" });
    }
  };
  return (
    <Sheet>
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
          <form action={handleSubmit}>
            <div className="flex flex-col gap-2 mt-5">
              <div className="flex flex-col gap-5">
                <FormInput
                  type="number"
                  name="inumber"
                  label="Inward Numer"
                  placeholder="Enter the number"
                  defaultValue={data?.inumber}
                />
                <FormInput
                  type="text"
                  name="customer"
                  label="Enter customer name"
                  defaultValue={data?.customer}
                />
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="addDate">Add Date</Label>
                  <Input
                    type="date"
                    id="addDate"
                    name="addDate"
                    defaultValue={data?.addDate ? new Date(data.addDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <FormInput
                  type="text"
                  name="item"
                  label="Enter item"
                  defaultValue={data?.item}
                />
                <FormInput
                  type="text"
                  name="packing"
                  label="Enter packing type"
                  defaultValue={data?.packing}
                />
                <FormInput
                  type="number"
                  name="weight"
                  label="Enter weight"
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
                  label="Enter store rate"
                  defaultValue={data?.store_rate}
                />
                <FormInput
                  type="number"
                  name="labour_rate"
                  label="Enter labour rate"
                  defaultValue={data?.labour_rate}
                />
                <FormInput
                  type="number"
                  name="labour_amount"
                  label="Enter labour amount"
                  defaultValue={data?.labour_amount}
                />
              </div>
            </div>
            <Button type="submit" className="mt-5">
              {title}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InwardData;
