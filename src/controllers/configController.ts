import type { Request, Response } from 'express';
import Joi from 'joi';
import { ruleService, type FraudRules } from '../services/ruleService.js';

const schema = Joi.object<FraudRules>({
	thresholds: Joi.object({
		largeAmount: Joi.number().min(0).required(),
		mediumAmount: Joi.number().min(0).required(),
	}).required(),
	suspiciousDomains: Joi.array().items(Joi.string()).required(),
	suspiciousTlds: Joi.array().items(Joi.string()).required(),
	weights: Joi.object({
		largeAmount: Joi.number().min(0).max(1).required(),
		mediumAmount: Joi.number().min(0).max(1).required(),
		suspiciousDomain: Joi.number().min(0).max(1).required(),
	}).required(),
	rulesEnabled: Joi.object({
		amountCheck: Joi.boolean().required(),
		domainCheck: Joi.boolean().required(),
		tldCheck: Joi.boolean().required(),
	}).required(),
});

export const updateFraudRules = (req: Request, res: Response) => {
	const { error, value } = schema.validate(req.body);
	if (error) return res.status(400).json({ error: error.message });
	ruleService.set(value);
	return res.json({ status: 'ok' });
};
