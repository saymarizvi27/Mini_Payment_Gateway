import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '../config/env.js';
import { type Express } from 'express';

export const applySecurity = (app: Express): void => {
	app.use(helmet());
	app.use(
		cors({
			origin: (origin, cb) => {
				if (!origin) return cb(null, true);
				if (env.ALLOWED_ORIGINS.includes('*') || env.ALLOWED_ORIGINS.includes(origin)) {
					return cb(null, true);
				}
				return cb(new Error('CORS not allowed'), false);
			},
			credentials: true,
		})
	);
	app.use(compression());
};
