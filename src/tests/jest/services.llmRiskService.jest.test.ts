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

  it('summarizes and caches results', async () => {
    const tx = { id: 't1', amount: 1200, currency: 'USD' };
    const a = await llmRiskService.summarize(tx, { email: 'a@b.com' });
    expect(a.provider.includes('mock')).toBe(true);
    const b = await llmRiskService.summarize(tx, { email: 'a@b.com' });
    expect(b.provider.endsWith('cached')).toBe(true);
  });
});


