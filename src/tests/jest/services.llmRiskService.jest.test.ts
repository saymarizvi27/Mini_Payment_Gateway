import { llmRiskService } from '../../services/llmRiskService';

describe('llmRiskService', () => {
  const OLD = process.env.LLM_PROVIDER;
  const OLD_OPENAI = process.env.OPENAI_API_KEY;
  beforeAll(() => {
    process.env.LLM_PROVIDER = 'mock';
    process.env.OPENAI_API_KEY = '';
  });
  afterAll(() => {
    process.env.LLM_PROVIDER = OLD;
    process.env.OPENAI_API_KEY = OLD_OPENAI;
  });

  it('summarizes and caches results (sigmoid risk model)', async () => {
    const tx = { id: 't1', amount: 1200, currency: 'USD' };
    const a = await llmRiskService.summarize(tx, { email: 'a@b.com' });
    expect(a.provider.includes('mock')).toBe(true);
    expect(a.summary).toMatch(/sigmoid model/);
    // Sigmoid: amount=1200 should be low risk
    expect(a.riskScore).toBeGreaterThan(0);
    expect(a.riskScore).toBeLessThan(0.5);
    const b = await llmRiskService.summarize(tx, { email: 'a@b.com' });
    expect(b.provider.endsWith('cached')).toBe(true);
  });

  it('returns higher risk for large amounts (sigmoid)', async () => {
    const tx = { id: 't2', amount: 10000, currency: 'USD' };
    const result = await llmRiskService.summarize(tx, { email: 'big@money.com' });
    expect(result.riskScore).toBeGreaterThan(0.85);
    expect(result.summary).toMatch(/sigmoid model/);
  });

  it('returns mid risk for mid amounts (sigmoid)', async () => {
    const tx = { id: 't3', amount: 5000, currency: 'USD' };
    const result = await llmRiskService.summarize(tx, { email: 'mid@money.com' });
    // Sigmoid(0) = 0.5
    expect(result.riskScore).toBeGreaterThan(0.45);
    expect(result.riskScore).toBeLessThan(0.55);
    expect(result.summary).toMatch(/sigmoid model/);
  });
});


