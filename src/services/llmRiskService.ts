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
	async summarize(tx: TransactionInput): Promise<RiskSummary> {
		const score = Math.min(1, (tx.amount / 10000)); // Convert to 0-1 range
		return {
			transactionId: tx.id,
			riskScore: score,
			summary: `Heuristic risk evaluation for ${tx.amount} ${tx.currency}.`,
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
		const result = await provider.summarize(tx, context);
		lru.set(key, result);
		await setCache(key, result, env.CACHE_TTL_SECONDS);
		return result;
	},
};