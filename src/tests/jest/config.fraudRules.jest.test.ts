import http from 'http';
import { app } from '../../app';

const createServer = () => {
  const server = http.createServer(app);
  return new Promise<{ server: http.Server; baseUrl: string }>((resolve, reject) => {
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('bind failed'));
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
};

describe('config: update fraud rules', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const s = await createServer();
    server = s.server;
    baseUrl = s.baseUrl;
    process.env.ADMIN_TOKEN = 'secret';
  });

  afterAll(() => {
    delete process.env.ADMIN_TOKEN;
    server.close();
  });

  it('rejects without admin token', async () => {
    const res = await fetch(`${baseUrl}/api/config/fraud-rules`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(res.status).toBe(401);
  });

  it('accepts with admin token and valid schema', async () => {
    const payload = {
      thresholds: { largeAmount: 9000, mediumAmount: 1500 },
      suspiciousDomains: ['temp'],
      suspiciousTlds: ['ru'],
      weights: { largeAmount: 0.5, mediumAmount: 0.25, suspiciousDomain: 0.35 },
      rulesEnabled: { amountCheck: true, domainCheck: true, tldCheck: true },
    };
    const res = await fetch(`${baseUrl}/api/config/fraud-rules`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: 'Bearer secret' },
      body: JSON.stringify(payload)
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });
});


