import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
	const header = req.header('authorization') || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : header;
	if (env.ADMIN_TOKEN && token === env.ADMIN_TOKEN) return next();
	return res.status(401).json({ error: 'Unauthorized' });
};
