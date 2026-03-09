import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(userId: string): string {
  const options: SignOptions = {
    subject: userId,
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({}, env.jwtSecret, options);
}
