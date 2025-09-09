import { ruleService, type FraudRules } from '../../services/ruleService';

describe('ruleService', () => {
  it('gets and sets rules', () => {
    const current = ruleService.get();
    const updated: FraudRules = {
      ...current,
      thresholds: { largeAmount: 9999, mediumAmount: 1234 },
    };
    ruleService.set(updated);
    expect(ruleService.get().thresholds.largeAmount).toBe(9999);
    expect(ruleService.get().thresholds.mediumAmount).toBe(1234);
    // restore
    ruleService.set(current);
  });
});


