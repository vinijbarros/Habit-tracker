const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

if (!jwtSecret) {
  throw new Error('Missing required env var: JWT_SECRET');
}

export const env = {
  jwtSecret,
  jwtExpiresIn,
};
