import { computeRiskScore, domainIsSuspicious, getEmailDomain } from '../../utils/risk';

describe('risk utils', () => {
  it('extracts email domain', () => {
    expect(getEmailDomain('a@b.com')).toBe('b.com');
  });

  it('flags suspicious domains', () => {
    expect(domainIsSuspicious('user@mailinator.com')).toBe(true);
    expect(domainIsSuspicious('user@good.com')).toBe(false);
  });

  it('computes risk scores in expected ranges', () => {
    const low = computeRiskScore(50, 'user@good.com');
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThan(0.5);

    const medium = computeRiskScore(1500, 'user@good.com');
    expect(medium).toBeGreaterThanOrEqual(0.3);

    const high = computeRiskScore(6000, 'user@bad.ru');
    expect(high).toBeGreaterThanOrEqual(0.5);
  });
});


