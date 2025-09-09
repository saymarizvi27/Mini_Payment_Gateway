import { env } from '../config/env.js';
import { getCache, setCache } from '../utils/cache.js';
import { LruCache } from '../utils/lru.js';
import OpenAI from 'openai';

export interface TransactionInput {
	id: string;
	amount: number;
	currency: string;
	cardCountry?: string;
	mcc?: string;
	ip?: string;
}

export interface RiskSummary {
	transactionId: string;
	riskScore: number; // 0-1
	summary: string;
	provider: string;
}

interface LlmProvider {
	summarize(tx: TransactionInput, context?: Record<string, unknown>): Promise<RiskSummary>;
}

class MockLlmProvider implements LlmProvider {
	   async summarize(tx: TransactionInput, context?: Record<string, unknown>): Promise<RiskSummary> {
		   // Use a sigmoid function for a more realistic, non-linear risk score
		   // Centered at 5000, steeper curve for higher amounts
		   const score = 1 / (1 + Math.exp(-((tx.amount - 5000) / 2000)));
		   const summary = `Transaction ${tx.id} for ${tx.amount} ${tx.currency} is evaluated as ${(score * 100).toFixed(1)}% risky (sigmoid model). Context: ${context ? JSON.stringify(context) : 'none'}`;
		   return {
			   transactionId: tx.id,
			   riskScore: score,
			   summary,
			   provider: 'mock',
		   };
	   }
}

class OpenAiLlmProvider implements LlmProvider {
	private client: OpenAI;
	private model: string;

	constructor() {
		this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
		this.model = (process.env.OPENAI_MODEL as string) || 'gpt-4o-mini';
	}

	async summarize(tx: TransactionInput, context?: Record<string, unknown>): Promise<RiskSummary> {
		const sys = `You are a fraud risk analyst. Analyze the transaction and produce (1) a risk score 0-1 and (2) a brief explanation.`;
		const user = JSON.stringify({ transaction: tx, context: context || {} });

		   try {
			   const completion = await this.client.chat.completions.create({
				   model: this.model,
				   messages: [
					   { role: 'system', content: sys },
					   { role: 'user', content: user },
				   ],
				   temperature: 0.2,
			   });

			   const content = completion.choices[0]?.message?.content || '';
			   const scoreMatch = content.match(/(risk\s*score|score)\s*[:=-]?\s*(\d*\.?\d+)/i);
			   const parsedScore = scoreMatch ? Number(scoreMatch[2]) : 0.5;
			   // If the parsed score looks like it's in 0-100 range, normalize it
			   const normalizedScore = parsedScore > 1 ? parsedScore / 100 : parsedScore;
			   const riskScore = Math.max(0, Math.min(1, normalizedScore));

			   return {
				   transactionId: tx.id,
				   riskScore,
				   summary: content || 'No summary',
				   provider: 'openai',
			   };
		   } catch (err: any) {
			   // Normalize OpenAI errors for the error handler
			   let message = 'External API error';
			   let status = 502;
			   if (err?.status) status = err.status;
			   if (err?.message) message = err.message;
			   if (err?.code === 'insufficient_quota' || err?.message?.includes('quota')) {
				   status = 429;
				   message = 'OpenAI quota exceeded';
			   }
			   const error: any = new Error(message);
			   error.status = status;
			   error.cause = err;
			   throw error;
		   }
	}
}

const provider: LlmProvider = env.LLM_PROVIDER === 'openai' ? new OpenAiLlmProvider() : new MockLlmProvider();

const lru = new LruCache<RiskSummary>(100);

const buildKey = (tx: TransactionInput, context?: Record<string, unknown>): string => {
	const payload = { tx, context: context || {} };
	return `risk:${env.LLM_PROVIDER}:${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
};

export const llmRiskService = {
   async summarize(tx: TransactionInput, context?: Record<string, unknown>) {
	   const key = buildKey(tx, context);
	   const local = lru.get(key);
	   if (local) return { ...local, provider: `${local.provider}-cached` };
	   const cached = await getCache<RiskSummary>(key);
	   if (cached) {
		   lru.set(key, cached);
		   return { ...cached, provider: `${cached.provider}-cached` };
	   }
	   try {
		   const result = await provider.summarize(tx, context);
		   lru.set(key, result);
		   await setCache(key, result, env.CACHE_TTL_SECONDS);
		   return result;
	   } catch (err: any) {
		   // Forward normalized error to Express error handler
		   throw err;
	   }
   },
};