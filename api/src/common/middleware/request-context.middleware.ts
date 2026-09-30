import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export type RequestWithContext = Request & {
  requestId?: string;
  user?: { id?: string; role?: string };
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction) {
    const incomingRequestId = req.get('x-request-id');
    const requestId = this.isValidRequestId(incomingRequestId)
      ? incomingRequestId!.trim()
      : randomUUID();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }

  private isValidRequestId(value?: string): boolean {
    return (
      typeof value === 'string' && /^[a-zA-Z0-9_\-.]{1,128}$/.test(value.trim())
    );
  }
}
