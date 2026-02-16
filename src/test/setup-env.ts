import dotenv from "dotenv";
import path from "path";

// Always load .env.test for Vitest
dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
});

// Ensure DATABASE_URL is overridden for Prisma
if (process.env.VITEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.VITEST_DATABASE_URL;
} else {
  throw new Error(
    "VITEST_DATABASE_URL is missing. Add it to .env.test"
  );
}