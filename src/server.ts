import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { app } from './app.js';

(async () => {
	app.listen(env.PORT, () => {
		logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
	});
})();
