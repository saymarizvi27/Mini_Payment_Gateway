import type { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../../middleware/auth';

const build = (auth?: string) => {
  const req = { header: (k: string) => (k === 'authorization' ? auth : undefined) } as unknown as Request;
  const resJson: any[] = [];
  const res = {
    status: (code: number) => ({ json: (obj: unknown) => resJson.push({ code, obj }) }),
  } as unknown as Response;
  let nextCalled = false;
  const next: NextFunction = () => { nextCalled = true; };
  return { req, res, next, resJson, nextCalled: () => nextCalled };
};

describe('requireAdmin', () => {
  const OLD = process.env.ADMIN_TOKEN;
  beforeAll(() => {
    process.env.ADMIN_TOKEN = 'secret';
  });
  afterAll(() => {
    process.env.ADMIN_TOKEN = OLD;
  });

  it('allows when bearer token matches', () => {
    const { req, res, next, nextCalled } = build('Bearer secret');
    requireAdmin(req, res, next);
    expect(nextCalled()).toBe(true);
  });

  it('rejects when token missing', () => {
    const { req, res, next, resJson } = build(undefined);
    requireAdmin(req, res, next);
    expect(resJson[0].code).toBe(401);
  });
});


