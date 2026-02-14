import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type Props = {
  type: string;
  placeholder?: string;
  label: string;
  name: string;
  defaultValue?: string;
};
const FormInput = ({ name, type, placeholder, label, defaultValue }: Props) => {
  return (
    <div className="mb-4">
      <Label htmlFor="name" className="mb-2 text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-ring"
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default FormInput;
