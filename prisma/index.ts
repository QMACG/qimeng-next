import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma/client'

const adapter = new PrismaMariaDb(process.env.KUN_DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

export { prisma }
