import type { Response } from 'express';

export function sendSuccess<T>(res: Response, statusCode: number, data: T): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
