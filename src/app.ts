import express from 'express';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { applySecurity } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/errors.js';
import routes from './routes/index.js';

export const app = express();

app.disable('x-powered-by');

applySecurity(app);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'));
app.use(
	(pinoHttp as unknown as (opts: unknown) => express.RequestHandler)({
		logger,
		customSuccessMessage: () => 'request completed',
		customErrorMessage: () => 'request failed',
	})
);

app.get('/health', (_req, res) =>
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || '0.1.0',
		cache: 'in-memory',
		provider: {
			payment: env.PAYMENT_PROVIDER,
			llm: env.LLM_PROVIDER,
		},
	})
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);
