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
import { addUpdateOutward } from "@/actions/user";
import { toast } from "../ui/use-toast";

type Props = {
  title: string;
  data: any;
};
const OutwardData = ({ title, data }: Props) => {
  const handleSubmit = async (formData: FormData) => {
    const response: any = await addUpdateOutward(formData, data);
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
                  type="number"
                  name="onumber"
                  label="Outward Numer"
                  placeholder="Enter the number"
                  defaultValue={data?.onumber}
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
                    id="outDate"
                    name="outDate"
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
                  type="number"
                  name="quantity"
                  label="Enter quantity"
                  defaultValue={data?.quantity}
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

export default OutwardData;
