import 'dotenv/config';
import Redis from 'ioredis';

const redisClient = new Redis({ // Fiz assim porque NÃO estava conectando no Docker !! <<
    host: process.env.REDIS_HOST || 'redis://redis:6379',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: undefined || process.env.REDIS_PASS
});

redisClient.on('connect', () => {
    if (process.env.NODE_ENV === 'production') {
        console.log('Redis rodando no ambiente de produção !');
    }

    else {
        console.log('Redis rodando localmente !');
    }
});

redisClient.on('error', (error) => {
    console.log(error.message);
});

export { redisClient };