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
  });
});


