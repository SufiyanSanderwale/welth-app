import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Force-load .env.local and override any pre-set values
dotenv.config({ path: ".env.local", override: true });

// TEMP: verify DATABASE_URL at runtime
console.log("DB URL prefix:", (process.env.DATABASE_URL || "").slice(0, 20));

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
