export interface TransactionLogEntry {
	id: string;
	timestamp: string;
	amount: number;
	currency: string;
	email: string;
	source: string;
	riskScore: number;
	status: 'success' | 'blocked';
	provider: string;
	metadata?: Record<string, unknown>;
}

const MAX_ENTRIES = 1000;
const entries: TransactionLogEntry[] = [];

export const transactionLog = {
	append(entry: TransactionLogEntry) {
		entries.push(entry);
		if (entries.length > MAX_ENTRIES) entries.shift();
	},
	all(): readonly TransactionLogEntry[] {
		return entries;
	},
	clear() {
		entries.length = 0;
	},
};
