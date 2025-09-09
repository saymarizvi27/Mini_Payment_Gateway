import dotenv from 'dotenv';

dotenv.config();

export type AppEnvironment = 'development' | 'test' | 'production';

const get = (key: string, fallback?: string): string => {
	const value = process.env[key];
	if (value === undefined || value === '') {
		if (fallback !== undefined) return fallback;
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const env = {
	NODE_ENV: (process.env.NODE_ENV as AppEnvironment) || 'development',
	PORT: Number(process.env.PORT || 3000),
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
	ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim()),
	REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
	// Payment provider placeholders
	PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
	// LLM provider
	LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai',
	OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
	OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
	// Redis / Cache
	REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
	CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 300),
	// Admin
	ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
};

export const isProduction = env.NODE_ENV === 'production';
