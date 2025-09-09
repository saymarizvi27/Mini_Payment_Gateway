import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectRedis } from './utils/cache.js';
import { app } from './app.js';

(async () => {
	await connectRedis().catch((err: unknown) => logger.warn({ err }, 'Redis connect failed'));
	app.listen(env.PORT, () => {
		logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
	});
})();
