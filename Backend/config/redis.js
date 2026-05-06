import { createClient } from 'redis'
import { config } from 'dotenv'
config()
export const redisClient = createClient({ url: process.env.REDIS_URL })
redisClient.on("error", (err) => console.error("Redis error", err))
redisClient.on("connect", () => console.log("Redis connected"))
export const connectRedis = async () => {
    await redisClient.connect()
}