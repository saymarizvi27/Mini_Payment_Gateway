import assert from 'assert';
import http from 'http';
import { app } from '../app';

const server = http.createServer(app);
server.listen(0);
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Failed to bind test server');
const baseUrl = `http://127.0.0.1:${address.port}`;

const fetchJson = async (path: string, body: unknown) => {
	const res = await fetch(`${baseUrl}${path}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	return { status: res.status, json: await res.json() };
};

// success case
const ok = await fetchJson('/api/charge', {
	amount: 100,
	currency: 'USD',
	source: 'tok_test',
	email: 'ok@example.com',
});
assert.strictEqual(ok.status, 201);
assert.strictEqual(ok.json.status, 'success');

// blocked case
const blocked = await fetchJson('/api/charge', {
	amount: 10000,
	currency: 'USD',
	source: 'tok_test',
	email: 'user@mailinator.com',
});
assert.strictEqual(blocked.status, 403);
assert.strictEqual(blocked.json.status, 'blocked');

server.close();
