import express from 'express';
import { authRoutes } from './routes/auth';
import { dayRoutes } from './routes/day';
import { habitsRoutes } from './routes/habits';
import { summaryRoutes } from './routes/summary';

const app = express();
const port = Number(process.env.PORT) || 3000;

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
    res.status(400).json({ message: 'Invalid JSON payload.' });
    return;
  }

  next(err);
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
