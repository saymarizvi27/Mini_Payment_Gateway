import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new (Redis as unknown as {
	new (url: string, opts: Record<string, unknown>): {
		status: string;
		connect: () => Promise<void>;
		get: (k: string) => Promise<string | null>;
		set: (...args: unknown[]) => Promise<unknown>;
	};
})(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 } as Record<string, unknown>);

export const connectRedis = async () => {
	if (redis.status === 'end' || redis.status === 'wait' || redis.status === 'close') {
		await redis.connect();
		logger.info('Redis connected');
	}
};

export const getCache = async <T>(key: string): Promise<T | null> => {
	try {
		const val = await redis.get(key);
		if (!val) return null;
		return JSON.parse(val) as T;
	} catch (err) {
		logger.warn({ err }, 'Redis get failed');
		return null;
	}
};

export const setCache = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
	try {
		await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
	} catch (err) {
		logger.warn({ err }, 'Redis set failed');
	}
};
