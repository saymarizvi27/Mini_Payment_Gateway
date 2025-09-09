import { proxyPaymentService } from '../../services/paymentService';

describe('paymentService', () => {
  it('creates and retrieves payments idempotently', async () => {
    const created1 = await proxyPaymentService.createPayment(
      { amount: 100, currency: 'USD', source: { token: 'tok' }, metadata: { provider: 'mock' } },
      { idempotencyKey: 'same' }
    );
    const created2 = await proxyPaymentService.createPayment(
      { amount: 100, currency: 'USD', source: { token: 'tok' }, metadata: { provider: 'mock' } },
      { idempotencyKey: 'same' }
    );
    expect(created1.id).toBe(created2.id);
    const retrieved = await proxyPaymentService.retrievePayment(created1.id);
    expect(retrieved.id).toBe(created1.id);
  });
});


