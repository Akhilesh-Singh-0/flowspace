import {z} from "zod/v3";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test'] as const).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if(!parsed.success){
    console.error("Invalid environmental variables:")
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data