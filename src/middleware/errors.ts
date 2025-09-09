import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export class HttpError extends Error {
	status: number;
	code?: string;
	constructor(status: number, message: string, code?: string) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

export const notFound = (req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
};

export const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (res.headersSent) return next(err as Error);
	const status = err instanceof HttpError ? err.status : 500;
	const message = err instanceof Error ? err.message : 'Internal Server Error';
	logger.error({ err }, 'Request failed');
	res.status(status).json({ error: message });
};
