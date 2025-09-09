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

describe('transactions list paging', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const s = await createServer();
    server = s.server;
    baseUrl = s.baseUrl;
  });

  afterAll(() => server.close());

  it('returns page metadata and items', async () => {
    const res = await fetch(`${baseUrl}/api/transactions?page=1&pageSize=5`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.page).toBe(1);
    expect(json.pageSize).toBe(5);
    expect(Array.isArray(json.items)).toBe(true);
    expect(typeof json.total).toBe('number');
  });
});


