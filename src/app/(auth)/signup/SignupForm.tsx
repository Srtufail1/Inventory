"use client";

import { loginSignup } from "@/actions/user";
import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await loginSignup(formData, false);
    if (res?.error) {
      toast({ title: res?.error, variant: "destructive" });
    } else {
      toast({ title: "User created successfully" });
      router.push("/dashboard/clients");
    }
    setLoading(false);
  };

  return (
    <div className="grid place-content-center min-h-screen bg-muted/30">
      <div className="flex flex-col justify-center gap-5 items-center py-10 w-[450px] shadow-lg rounded-lg bg-card">
        <h1 className="text-center font-bold text-4xl">Create New User</h1>
        <p className="text-muted-foreground text-sm px-5 text-center">
          Super Admin: Create a new user account
        </p>
        <form action={handleSubmit} className="w-full px-5">
          <FormInput
            name="name"
            type="text"
            placeholder="Enter user's name"
            label="Full Name"
          />
          <FormInput
            name="email"
            type="email"
            placeholder="Enter the email"
            label="Email"
          />
          <FormInput
            name="password"
            type="password"
            placeholder="Enter the password"
            label="Password"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
        <Link
          href="/dashboard/clients"
          className="text-center text-blue-800 cursor-pointer underline"
        >
          Back to Clients
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;