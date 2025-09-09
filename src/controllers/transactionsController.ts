import type { Request, Response } from 'express';
import { transactionLog } from '../services/transactionLog.js';

export const listTransactions = (req: Request, res: Response) => {
	const page = Math.max(1, Number(req.query.page || 1));
	const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
	const all = transactionLog.all();
	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	const items = all.slice().reverse().slice(start, end);
	res.json({ page, pageSize, total: all.length, items });
};
