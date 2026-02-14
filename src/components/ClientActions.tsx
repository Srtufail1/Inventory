import React, { useState } from "react";
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
import FormInput from "./FormInput";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { updateUserRole } from "@/actions/user";
import { toast } from "./ui/use-toast";
import { Switch } from "./ui/switch";

const ClientActions = ({ row }: any) => {
  const data = row.original;
  const [isAdmin, setIsAdmin] = useState<boolean>(data?.isAdmin ?? false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(
    data?.isSuperAdmin ?? false
  );
  const [accessType, setAccessType] = useState<"worldwide" | "token">(
    data?.loginToken === "false" || data?.loginToken === false
      ? "worldwide"
      : "token"
  );
  const [loginToken, setLoginToken] = useState<string>(
    data?.loginToken === "false" || data?.loginToken === false
      ? ""
      : data?.loginToken ?? ""
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    const updatedData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      isAdmin,
      isSuperAdmin,
      loginToken: accessType === "worldwide" ? "false" : loginToken,
    };

    try {
      const response: any = await updateUserRole(formData, updatedData, data);

      if (response?.error) {
        toast({ title: response.error, variant: "destructive" });
      } else {
        toast({ title: "User updated successfully" });
        setIsOpen(false);
      }
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperAdminChange = (checked: boolean) => {
    setIsSuperAdmin(checked);
    if (checked) setIsAdmin(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit User</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Make changes to the user here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>

        <form action={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <FormInput
                type="text"
                name="name"
                label="Name"
                defaultValue={data?.name}
              />
              <FormInput
                type="email"
                name="email"
                label="Email"
                defaultValue={data?.email}
              />
            </div>

            {/* Permissions Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Permissions
              </Label>

              {/* Admin Toggle */}
              <div className="flex items-center rounded-lg border p-3">
                <Label htmlFor="isAdmin" className="text-sm font-medium">
                  Admin
                </Label>

                <Switch
                  id="isAdmin"
                  checked={isAdmin}
                  onCheckedChange={setIsAdmin}
                  className="ml-auto"
                />
              </div>



              {/* Super Admin Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-3">
                <Label htmlFor="isSuperAdmin" className="text-sm font-medium cursor-pointer">
                  Super Admin
                </Label>
                <Switch
                  id="isSuperAdmin"
                  checked={isSuperAdmin}
                  onCheckedChange={handleSuperAdminChange}
                />
              </div>
            </div>

            {/* Access Type Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Access Type
              </Label>
              <Select
                value={accessType}
                onValueChange={(val: "worldwide" | "token") => {
                  setAccessType(val);
                  if (val === "worldwide") setLoginToken("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="worldwide">World Wide</SelectItem>
                    <SelectItem value="token">Token Based</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {accessType === "token" && (
                <div className="space-y-2">
                  <Label htmlFor="loginToken" className="text-sm">
                    Login Token
                  </Label>
                  <Input
                    id="loginToken"
                    type="text"
                    value={loginToken}
                    onChange={(e) => setLoginToken(e.target.value)}
                    placeholder="Enter login token"
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="mt-8 w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ClientActions;