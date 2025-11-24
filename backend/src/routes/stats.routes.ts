import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user stats and progress
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalVideosWatched: true,
        totalWatchTime: true,
        lastWatchedDate: true,
      },
    });

    // Get video stats
    const totalVideos = await prisma.video.count({
      where: { userId },
    });

    const viewedVideos = await prisma.video.count({
      where: { userId, viewed: true },
    });

    // Get favorites count
    const favoritesCount = await prisma.favorite.count({
      where: { userId },
    });

    // Get goals stats
    const totalGoals = await prisma.goal.count({
      where: { userId },
    });

    const completedGoals = await prisma.goal.count({
      where: { userId, completed: true },
    });

    // Get journal entries count
    const journalEntriesCount = await prisma.journalEntry.count({
      where: { userId },
    });

    // Get achievements count
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId },
    });

    // Get weekly activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyVideos = await prisma.video.count({
      where: {
        userId,
        viewed: true,
        viewedAt: { gte: weekAgo },
      },
    });

    res.json({
      stats: {
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalVideosWatched: user?.totalVideosWatched || 0,
        totalWatchTime: user?.totalWatchTime || 0,
        lastWatchedDate: user?.lastWatchedDate,
        totalVideos,
        viewedVideos,
        favoritesCount,
        totalGoals,
        completedGoals,
        journalEntriesCount,
        achievementsCount,
        weeklyVideos,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get activity calendar (videos by date)
router.get('/calendar', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { month, year } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const videos = await prisma.video.findMany({
      where: {
        userId,
        viewed: true,
        viewedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        viewedAt: true,
        category: true,
      },
      orderBy: { viewedAt: 'asc' },
    });

    res.json({ videos });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

export default router;
