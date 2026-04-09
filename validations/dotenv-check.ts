import { z } from 'zod'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as fs from 'fs'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = path.resolve(__dirname, '..', '.env')
if (!fs.existsSync(envPath)) {
  console.error('.env file not found in the project root.')
  process.exit(1)
}

config({ path: envPath })

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}, z.string().url().optional())

export const envSchema = z.object({
  KUN_DATABASE_URL: z.string().url(),
  KUN_VISUAL_NOVEL_SITE_URL: z.string().url(),
  KUN_VISUAL_NOVEL_SITE_URLS: z.string().optional(),
  KUN_VISUAL_NOVEL_NAV_URL: optionalUrl,
  KUN_VISUAL_NOVEL_GITHUB_REPO_URL: optionalUrl,
  KUN_VISUAL_NOVEL_TELEGRAM_GROUP_URL: optionalUrl,

  NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV: z.string(),
  NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),

  JWT_ISS: z.string(),
  JWT_AUD: z.string(),
  JWT_SECRET: z.string(),

  NODE_ENV: z.enum(['development', 'test', 'production']),

  KUN_VISUAL_NOVEL_EMAIL_FROM: z.string().min(1),
  KUN_VISUAL_NOVEL_EMAIL_HOST: z.string().min(1),
  KUN_VISUAL_NOVEL_EMAIL_PORT: z.string().regex(/^\d+$/),
  KUN_VISUAL_NOVEL_EMAIL_ACCOUNT: z.string().email(),
  KUN_VISUAL_NOVEL_EMAIL_PASSWORD: z.string().min(1),

  KUN_VISUAL_NOVEL_TEST_SITE_LABEL: z.string().optional()
})

export const env = envSchema.safeParse(process.env)

if (!env.success) {
  throw new Error(
    'Invalid environment variables: ' +
      JSON.stringify(env.error.format(), null, 4)
  )
}
