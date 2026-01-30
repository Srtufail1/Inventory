import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const credentialsConfig = CredentialsProvider({
  name: "Credentials",
  credentials: {
    name: {
      label: "User Name",
    },
    email: {
      label: "Email",
      type: "email",
    },
    password: {
      label: "Password",
      type: "password",
    },
  },

  async authorize(credentials: any) {
    const { name, email, password, isLogin } = credentials;
    const user = await db.user.findUnique({
      where: { email },
    });

    if (isLogin === "false" && !user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await db.user.create({
        data: { 
          name, 
          email, 
          password: hashedPassword
        },
      });

      if (result) return result;
      return null;
    } 
    
    if (user) {
      const isHashed = user.password.startsWith("$2");
      
      if (isHashed) {
        // Password is hashed - use bcrypt compare
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) return user;
      } else {
        // Password is plain text (old user) - compare directly
        // Then auto-upgrade to hashed password
        if (user.password === password) {
          const hashedPassword = await bcrypt.hash(password, 12);
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          return user;
        }
      }
    }
    
    return null;
  },
});

const config = {
  providers: [Google, credentialsConfig],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);