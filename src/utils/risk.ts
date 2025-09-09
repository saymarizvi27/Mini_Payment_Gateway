import { ruleService } from '../services/ruleService.js';

export const getEmailDomain = (email: string): string => email.split('@')[1]?.toLowerCase() || '';

export const domainIsSuspicious = (email: string): boolean => {
	const rules = ruleService.get();
	const domain = getEmailDomain(email);
	const baseSuspicious = new RegExp(
		`(${rules.suspiciousDomains.join('|')})|\\.(${rules.suspiciousTlds.join('|')})$`,
		'i'
	);
	return baseSuspicious.test(domain);
};

export const computeRiskScore = (amount: number, email: string): number => {
	const rules = ruleService.get();
	let score = 0;
	if (rules.rulesEnabled.amountCheck) {
		if (amount >= rules.thresholds.largeAmount) score += rules.weights.largeAmount;
		else if (amount >= rules.thresholds.mediumAmount) score += rules.weights.mediumAmount;
	}
	if (rules.rulesEnabled.domainCheck && domainIsSuspicious(email)) score += rules.weights.suspiciousDomain;
	return Math.min(1, score);
};
