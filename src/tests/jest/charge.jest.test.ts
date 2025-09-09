import http from 'http';
import { app } from '../../app';

const createTestServer = () => {
  const server = http.createServer(app);
  return new Promise<{ server: http.Server; baseUrl: string }>((resolve, reject) => {
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('Failed to bind test server'));
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
};

describe('charge endpoint', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const started = await createTestServer();
    server = started.server;
    baseUrl = started.baseUrl;
  });

  afterAll(() => {
    server.close();
  });

  const fetchJson = async (path: string, body: unknown) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() } as { status: number; json: any };
  };

  it('returns success for a normal charge', async () => {
    const ok = await fetchJson('/api/charge', {
      amount: 100,
      currency: 'USD',
      source: 'tok_test',
      email: 'ok@example.com',
    });
    expect(ok.status).toBe(201);
    expect(ok.json.status).toBe('success');
  });

  it('blocks suspicious high amount/domain', async () => {
    const blocked = await fetchJson('/api/charge', {
      amount: 10000,
      currency: 'USD',
      source: 'tok_test',
      email: 'user@mailinator.com',
    });
    expect(blocked.status).toBe(403);
    expect(blocked.json.status).toBe('blocked');
  });
});


