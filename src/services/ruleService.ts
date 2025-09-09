import defaults from '../config/fraudRules.js';

export interface FraudRules {
	thresholds: {
		largeAmount: number;
		mediumAmount: number;
	};
	suspiciousDomains: string[];
	suspiciousTlds: string[];
	weights: {
		largeAmount: number;
		mediumAmount: number;
		suspiciousDomain: number;
	};
	rulesEnabled: {
		amountCheck: boolean;
		domainCheck: boolean;
		tldCheck: boolean;
	};
}

let currentRules: FraudRules = (defaults as unknown) as FraudRules;

export const ruleService = {
	get(): FraudRules {
		return currentRules;
	},
	set(newRules: FraudRules) {
		currentRules = newRules;
	},
};
