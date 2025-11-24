import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import videoRoutes from './routes/video.routes';
import statsRoutes from './routes/stats.routes';
import favoritesRoutes from './routes/favorites.routes';
import reactionsRoutes from './routes/reactions.routes';
import achievementsRoutes from './routes/achievements.routes';
import goalsRoutes from './routes/goals.routes';
import journalRoutes from './routes/journal.routes';
import quotesRoutes from './routes/quotes.routes';
import languageRoutes from './routes/language.routes';
import voiceCloneRoutes from './routes/voice-clone.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_WEB_URL || 'http://localhost:5173',
    process.env.FRONTEND_MOBILE_URL || 'exp://localhost:19000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded media)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Sentiments API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/voice-clones', voiceCloneRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
