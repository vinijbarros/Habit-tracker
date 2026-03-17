import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { debugError, debugLog } from '../utils/debug';

interface JwtPayload {
  sub?: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    debugLog('AUTH', 'Missing authorization header', { method: req.method, path: req.path });
    res.status(401).json({ message: 'Authorization header is required.' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    debugLog('AUTH', 'Invalid authorization format', { method: req.method, path: req.path });
    res.status(401).json({ message: 'Invalid authorization format. Use Bearer <token>.' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    if (!payload.sub) {
      debugLog('AUTH', 'Token payload without subject', { method: req.method, path: req.path });
      res.status(401).json({ message: 'Invalid token payload.' });
      return;
    }

    req.userId = payload.sub;
    debugLog('AUTH', 'Token validated', { userId: req.userId, method: req.method, path: req.path });
    next();
  } catch (error) {
    debugError('AUTH', 'Invalid or expired token', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
