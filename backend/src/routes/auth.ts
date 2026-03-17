import type { Request, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';
import { debugError, debugLog } from '../utils/debug';
import { generateToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    debugLog('AUTH', 'Register validation failed: missing required fields');
    res.status(400).json({ message: 'name, email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (password.length < 6) {
    debugLog('AUTH', 'Register validation failed: short password', { email: normalizedEmail });
    res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    return;
  }

  try {
    debugLog('AUTH', 'Register attempt', { email: normalizedEmail });
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = generateToken(user.id);
    debugLog('AUTH', 'Register success', { userId: user.id, email: user.email });

    res.status(201).json({ token, user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      debugLog('AUTH', 'Register conflict: email already in use', { email: normalizedEmail });
      res.status(409).json({ message: 'Email is already in use.' });
      return;
    }

    debugError('AUTH', 'Register failed with unexpected error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    debugLog('AUTH', 'Login validation failed: missing required fields');
    res.status(400).json({ message: 'email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    debugLog('AUTH', 'Login attempt', { email: normalizedEmail });
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      debugLog('AUTH', 'Login failed: user not found', { email: normalizedEmail });
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      debugLog('AUTH', 'Login failed: invalid password', { email: normalizedEmail });
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user.id);
    debugLog('AUTH', 'Login success', { userId: user.id, email: user.email });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    debugError('AUTH', 'Login failed with unexpected error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  if (!req.userId) {
    debugLog('AUTH', 'Me request without userId after auth middleware');
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  try {
    debugLog('AUTH', 'Me request', { userId: req.userId });
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      debugLog('AUTH', 'Me request user not found', { userId: req.userId });
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    debugError('AUTH', 'Me request failed with unexpected error', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export { router as authRoutes };
