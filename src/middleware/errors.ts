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
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (res.headersSent) return next(err);

	// Handle OpenAI or external API quota/rate limit errors
	if (err?.code === 'insufficient_quota' || err?.status === 429) {
		logger.error({ err }, 'External API quota/rate limit error');
		return res.status(429).json({
			status: 'error',
			message: 'LLM provider quota exceeded. Please try again later or contact support.',
			details: err.error?.message || err.message,
			request_id: err.request_id,
		});
	}

	// Default error handling
	const status = err instanceof HttpError ? err.status : 500;
	const message = err instanceof Error ? err.message : 'Internal Server Error';
	logger.error({ err }, 'Request failed');
	res.status(status).json({ error: message });
};
