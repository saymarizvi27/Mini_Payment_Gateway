import type { Request, Response } from 'express';
import Joi from 'joi';
import { HttpError } from '../middleware/errors.js';
import { llmRiskService } from '../services/llmRiskService.js';
import { proxyPaymentService } from '../services/paymentService.js';
import { computeRiskScore } from '../utils/risk.js';
import { transactionLog } from '../services/transactionLog.js';

const schema = Joi.object({
	amount: Joi.number().positive().required(),
	currency: Joi.string().uppercase().length(3).required(),
	source: Joi.string().required(),
	email: Joi.string().email().required(),
});

export const postCharge = async (req: Request, res: Response, next: Function) => {
   try {
	   const { error, value } = schema.validate(req.body, { abortEarly: false });
	   if (error) throw new HttpError(400, `Invalid payload: ${error.message}`);
	   const { amount, currency, source, email } = value as {
		   amount: number;
		   currency: string;
		   source: string;
		   email: string;
	   };

	   const transactionId = `txn_${Date.now()}`;
	   const riskScore = computeRiskScore(amount, email);
	   const riskSummary = await llmRiskService.summarize(
		   {
			   id: transactionId,
			   amount,
			   currency,
		   },
		   { email, source }
	   );

	   if (riskScore >= 0.5) {
		   transactionLog.append({
			   id: transactionId,
			   timestamp: new Date().toISOString(),
			   amount,
			   currency,
			   email,
			   source,
			   riskScore,
			   status: 'blocked',
			   provider: 'blocked',
			   metadata: { reason: 'High risk' },
		   });
		   return res.status(403).json({
			   transactionId,
			   provider: 'blocked',
			   status: 'blocked',
			   riskScore,
			   explanation: riskSummary.summary,
		   });
	   }

	   // Route to Stripe for all approved payments
	   const provider = 'stripe';

	   await proxyPaymentService.createPayment(
		   {
			   amount: Math.round(amount),
			   currency,
			   source: { token: source },
			   metadata: { email, transactionId, provider },
		   },
		   { idempotencyKey: req.header('Idempotency-Key') || undefined }
	   );

	   transactionLog.append({
		   id: transactionId,
		   timestamp: new Date().toISOString(),
		   amount,
		   currency,
		   email,
		   source,
		   riskScore,
		   status: 'success',
		   provider,
	   });

	   return res.status(201).json({
		   transactionId,
		   provider,
		   status: 'success',
		   riskScore,
		   explanation: riskSummary.summary,
	   });
   } catch (err) {
	   next(err);
   }
};
