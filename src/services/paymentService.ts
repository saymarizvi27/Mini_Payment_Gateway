import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePaymentInput {
	amount: number;
	currency: string;
	source: { token: string };
	metadata?: Record<string, unknown> & { provider?: 'stripe' | 'mock' };
}

export interface Payment {
	id: string;
	status: 'succeeded' | 'pending' | 'failed';
	amount: number;
	currency: string;
	createdAt: string;
	provider: string;
	metadata?: Record<string, unknown>;
}

interface CreateOptions { idempotencyKey?: string }

class MockPaymentProvider {
	private store = new Map<string, Payment>();

	async createPayment(input: CreatePaymentInput, opts: CreateOptions): Promise<Payment> {
		const id = opts.idempotencyKey || uuidv4();
		if (this.store.has(id)) return this.store.get(id)!;
		const payment: Payment = {
			id,
			status: 'succeeded',
			amount: input.amount,
			currency: input.currency,
			createdAt: new Date().toISOString(),
			provider: 'mock',
			metadata: input.metadata,
		};
		this.store.set(id, payment);
		return payment;
	}

	async retrievePayment(id: string): Promise<Payment | null> {
		return this.store.get(id) || null;
	}
}

// Stripe provider; reuse mock behavior for now
class StripePaymentProvider extends MockPaymentProvider {}

const providers = {
	stripe: new StripePaymentProvider(),
	mock: new MockPaymentProvider(),
} as const;

type ProviderName = keyof typeof providers;

const resolveProvider = (name?: string): ProviderName => {
	if (name === 'stripe' || name === 'mock') return name;
	const envName = env.PAYMENT_PROVIDER as ProviderName;
	return envName in providers ? envName : 'stripe';
};

export const proxyPaymentService = {
	createPayment: (input: CreatePaymentInput, opts: CreateOptions) => {
		const providerName = resolveProvider(input.metadata?.provider as string | undefined);
		return providers[providerName].createPayment(input, opts);
	},
	retrievePayment: async (id: string) => {
		for (const name of Object.keys(providers) as ProviderName[]) {
			const res = await providers[name].retrievePayment(id);
			if (res) return res;
		}
		throw new Error('Payment not found');
	},
};
