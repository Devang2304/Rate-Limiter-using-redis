const redis = require('redis')
const dotenv = require('dotenv')
dotenv.config();
const client = redis.createClient({
    password: process.env.PASSWORD,
    socket: {
        host: process.env.HOST,
        port: process.env.REDIS_PORT
    }
})

const rateLimiter = (allowedRequests, time) => {
    return async (req, res, next)=> {
            try {
                const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
                console.log(ip)
                if (!client.isOpen) {
                    await client.connect();
                }
                let ttl
                const requests = await client.incr(ip)
                if (requests === 1) {
                    await client.expire(ip, time)
                    ttl = time
                } else {
                    ttl = await client.ttl(ip)
                }
                console.log("requests: ",requests);
                console.log("allowedRequests: ",allowedRequests);
                if (requests > allowedRequests) {
                    return res.status(429).json({
                        error: 'Too many requests. Try again after sometime. TTL' + ttl
                    });
                }
                next();
            } catch (err) {
                return res.status(500).json({
                    error: 'An error occurred while processing the request!' + err
                });
            }
        }
    }

    module.exports =rateLimiter