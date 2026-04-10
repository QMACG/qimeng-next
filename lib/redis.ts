import Redis from 'ioredis'

const KUN_PATCH_REDIS_PREFIX = 'qimeng:site'
const redisPort = Number.parseInt(process.env.REDIS_PORT || '6379', 10)
const redisDb = Number.parseInt(process.env.REDIS_DB || '0', 10)
let hasLoggedRedisError = false

export const redis = new Redis({
  port: Number.isNaN(redisPort) ? 6379 : redisPort,
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number.isNaN(redisDb) ? 0 : redisDb,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
})

redis.on('error', (error) => {
  if (!hasLoggedRedisError) {
    hasLoggedRedisError = true
    console.error('[redis] connection error:', error.message)
  }
})

redis.on('ready', () => {
  hasLoggedRedisError = false
})

export const setKv = async (key: string, value: string, time?: number) => {
  const keyString = `${KUN_PATCH_REDIS_PREFIX}:${key}`
  if (time) {
    await redis.setex(keyString, time, value)
  } else {
    await redis.set(keyString, value)
  }
}

export const getKv = async (key: string) => {
  const keyString = `${KUN_PATCH_REDIS_PREFIX}:${key}`
  const value = await redis.get(keyString)
  return value
}

export const delKv = async (key: string) => {
  const keyString = `${KUN_PATCH_REDIS_PREFIX}:${key}`
  await redis.del(keyString)
}

export const incrKv = async (key: string) => {
  const keyString = `${KUN_PATCH_REDIS_PREFIX}:${key}`
  return redis.incr(keyString)
}

export const expireKv = async (key: string, time: number) => {
  const keyString = `${KUN_PATCH_REDIS_PREFIX}:${key}`
  return redis.expire(keyString, time)
}
