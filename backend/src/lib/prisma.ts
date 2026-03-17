import { PrismaClient } from '@prisma/client';
import { debugLog } from '../utils/debug';

export const prisma = new PrismaClient();

debugLog('PRISMA', 'Prisma client initialized');
