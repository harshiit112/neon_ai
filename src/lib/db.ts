import { PrismaClient } from "./generated/prisma/client.js";

import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    keepAlive: true,
});

const adapter = new PrismaPg(pool);

declare global {
    var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = prisma;
}