"use client";
import { loginSignup } from "@/actions/user";
import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import React, { useOptimistic, useState } from "react";
import Image1 from "../../../../public/image.png";
import Logo from "../../../../public/logo.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import Image from 'next/image'

const Login = () => {
  const [loading, setLoading] = useOptimistic(false);
  const [ showPassword, setShowPassword ] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await loginSignup(formData, true);
    if (res?.error) {
      toast({ title: res?.error });
    }
    setLoading(false);
  };
  return (
  <div className="login-main">
    <div className="login-left">
      <Image src={Image1} alt="Login background" layout="fill" objectFit="cover" />
    </div>
    <div className="login-right">
      <div className="login-right-container">
        <div className="login-logo">
          <Image src={Logo} alt="" />
        </div>
        <div className="login-center">
          <h2>ZamZam Cold Storage</h2>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <form action={handleSubmit} className="w-full px-5">
            <FormInput
              name="email"
              type="email"
              placeholder="Email"
              label=""
            />
            <div className="pass-input-div">
              <FormInput
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                label=""
              />
              {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
            </div>
            <div className="login-center-buttons">
              <Button
                type="submit"
                className={`${
                  loading && "disabled cursor-not-allowed"
                } w-full bg-blue-500`}
              >
                {loading ? "loading..." : "Login"}
              </Button>
            </div>
          </form>
        </div>

        <p className="login-bottom-p">
          For login credentials, please contact the site owner or administrator
        </p>
      </div>
    </div>
  </div>
  );
};

export default Login;
