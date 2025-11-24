import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get today's quote
router.get('/today', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let quote = await prisma.dailyQuote.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // If no quote for today, get a random one
    if (!quote) {
      const quotes = await prisma.dailyQuote.findMany();
      if (quotes.length > 0) {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
      }
    }

    res.json({ quote });
  } catch (error) {
    console.error('Get daily quote error:', error);
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

// Get random quote
router.get('/random', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = category;

    const quotes = await prisma.dailyQuote.findMany({ where });

    if (quotes.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Get random quote error:', error);
    res.status(500).json({ error: 'Failed to fetch random quote' });
  }
});

export default router;
