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

describe('health route and security headers', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const s = await createServer();
    server = s.server;
    baseUrl = s.baseUrl;
  });

  afterAll(() => server.close());

  it('returns enriched health info and security headers', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(typeof json.timestamp).toBe('string');
    expect(typeof json.version).toBe('string');
    expect(json.cache).toBe('in-memory');
    expect(json.provider.payment).toBeDefined();
    expect(json.provider.llm).toBeDefined();

    // a few helmet headers
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});


