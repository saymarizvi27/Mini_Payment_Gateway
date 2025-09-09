import { transactionLog } from '../../services/transactionLog';

describe('transactionLog', () => {
  beforeEach(() => {
    transactionLog.clear();
  });

  it('appends and lists entries', () => {
    transactionLog.append({
      id: '1',
      timestamp: new Date().toISOString(),
      amount: 100,
      currency: 'USD',
      email: 'a@b.com',
      source: 'tok',
      riskScore: 0.1,
      status: 'success',
      provider: 'mock',
    });
    expect(transactionLog.all().length).toBe(1);
  });
});


