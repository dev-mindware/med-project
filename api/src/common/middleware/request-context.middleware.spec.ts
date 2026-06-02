import { RequestContextMiddleware } from './request-context.middleware';

describe('RequestContextMiddleware', () => {
  it('uses the incoming x-request-id when present', () => {
    const middleware = new RequestContextMiddleware();
    const req: any = { get: jest.fn().mockReturnValue('req-123') };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBe('req-123');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-123');
    expect(next).toHaveBeenCalled();
  });

  it('generates a request id when absent', () => {
    const middleware = new RequestContextMiddleware();
    const req: any = { get: jest.fn().mockReturnValue(undefined) };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toEqual(expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});
