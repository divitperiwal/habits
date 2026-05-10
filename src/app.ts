import express from 'express';
import helmet from 'helmet';
import { sendSuccess } from './utils/response/response';
import { errorHandler, notFound } from './middlewares/error.middleware';
import authRoutes from '@/modules/auth/auth.route';
import habitRoutes from '@/modules/habits/habits.route';
import trackingRoutes from '@/modules/tracking/tracking.route';

const app = express();

app.use(helmet())
app.use(express.json());

app.get('/', (_, res) => {
    sendSuccess(res, 200, 'Welcome to the Habit Tracker API');
});

app.get('/health', (_, res) => {
    sendSuccess(res, 200, "Server is healthy", { timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/habits/:id', trackingRoutes);

app.use(errorHandler)
app.use(notFound)
export default app;
