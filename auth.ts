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

  async authorize(credentials) {
    const { name, email, password, isLogin } = credentials as {
      name?: string;
      email: string;
      password: string;
      isLogin: string;
    };

    if (!email || !password) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Signup flow
    if (isLogin === "false") {
      if (user) {
        return null; // User already exists
      }

      if (!name?.trim()) {
        return null; // Name required for signup
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await db.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      return newUser;
    }

    // Login flow
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  },
});

const config = {
  providers: [Google, credentialsConfig],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);