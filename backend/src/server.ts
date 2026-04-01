import cors from 'cors';
import express from 'express';
import { authRoutes } from './routes/auth';
import { dayRoutes } from './routes/day';
import { habitsRoutes } from './routes/habits';
import { summaryRoutes } from './routes/summary';
import { debugError, debugLog } from './utils/debug';

const app = express();
const port = Number(process.env.PORT) || 3000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use((req, res, next) => {
  const startedAt = Date.now();
  debugLog('HTTP', 'Incoming request', {
    method: req.method,
    path: req.originalUrl,
  });

  res.on('finish', () => {
    debugLog('HTTP', 'Request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.use(
  cors({
    origin: corsOrigin,
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/habits', habitsRoutes);
app.use('/day', dayRoutes);
app.use('/summary', summaryRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    debugError('HTTP', 'Invalid JSON payload', err);
    res.status(400).json({ message: 'Invalid JSON payload.' });
    return;
  }

  next(err);
});

app.listen(port, () => {
  debugLog('SERVER', `Backend running at http://localhost:${port}`);
});
