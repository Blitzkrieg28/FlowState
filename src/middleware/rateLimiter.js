import { redis, redisPublisher } from '../config/redisClient.js'; // Import publisher

// Remove 'io' from parameters
export const customRateLimiter = ({ secondsWindow, allowedHits }) => {
    return async (req, res, next) => {
        try {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const key = `rate-limit:${ip}`; // Use a clearer key prefix
            const allBuckets = await redis.hGetAll(key);

            let totalRequests = 0;
            const windowStart = Math.floor(Date.now() / 1000) - secondsWindow;

            for (const sec in allBuckets) {
                if (parseInt(sec) > windowStart) {
                    totalRequests += parseInt(allBuckets[sec]);
                }
            }

            // Small correction: Check >= allowedHits
            if (totalRequests >= allowedHits) {
                // Publish an event to Redis instead of emitting via io
                const message = JSON.stringify({ ip: ip, blockedAt: Date.now() });
                await redisPublisher.publish('rate-limit-events', message);

                return res.status(429).json({
                    error: 'Too many requests!'
                });
            }

            const currentSecond = Math.floor(Date.now() / 1000);

            await redis.multi()
                .hIncrBy(key, currentSecond.toString(), 1) // Ensure field is a string
                .expire(key, secondsWindow)
                .exec();

            next();
        } catch (error) {
            next(error);
        }
    };
};