import type { Request, Response, NextFunction } from 'express';
import { errorHandler, HttpError, notFound } from '../../middleware/errors';

describe('errors middleware', () => {
  it('notFound returns 404', () => {
    const resOut: any[] = [];
    const req = {} as Request;
    const res = { status: (c: number) => ({ json: (o: any) => resOut.push({ c, o }) }) } as unknown as Response;
    notFound(req, res);
    expect(resOut[0].c).toBe(404);
  });

  it('errorHandler handles HttpError', () => {
    const resOut: any[] = [];
    const req = {} as Request;
    const res = { headersSent: false, status: (c: number) => ({ json: (o: any) => resOut.push({ c, o }) }) } as unknown as Response;
    const next = (() => {}) as NextFunction;
    errorHandler(new HttpError(400, 'Bad'), req, res, next);
    expect(resOut[0].c).toBe(400);
    expect(resOut[0].o.error).toBe('Bad');
  });

  it('errorHandler handles external API quota error', () => {
    const resOut: any[] = [];
    const req = {} as Request;
    const res = { headersSent: false, status: (c: number) => ({ json: (o: any) => resOut.push({ c, o }) }) } as unknown as Response;
    const next = (() => {}) as NextFunction;
    const err = {
      code: 'insufficient_quota',
      status: 429,
      error: { message: 'You exceeded your current quota.' },
      request_id: 'req_123',
      message: 'You exceeded your current quota.'
    };
    errorHandler(err, req, res, next);
    expect(resOut[0].c).toBe(429);
    expect(resOut[0].o.status).toBe('error');
    expect(resOut[0].o.message).toMatch(/quota exceeded/i);
    expect(resOut[0].o.details).toMatch(/exceeded your current quota/i);
    expect(resOut[0].o.request_id).toBe('req_123');
  });
});


