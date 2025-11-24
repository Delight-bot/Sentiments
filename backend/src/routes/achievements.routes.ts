import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all achievements and user's unlocked ones
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { threshold: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    const achievements = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
    }));

    res.json({ achievements, recentlyUnlocked: userAchievements.slice(0, 5) });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Check and unlock achievements (called internally after actions)
export async function checkAndUnlockAchievements(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) return [];

    const allAchievements = await prisma.achievement.findMany();
    const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement) {
        case 'watch_videos':
          shouldUnlock = user.totalVideosWatched >= achievement.threshold;
          break;
        case 'streak_days':
          shouldUnlock = user.currentStreak >= achievement.threshold;
          break;
        case 'create_goal':
          const goalsCount = await prisma.goal.count({ where: { userId } });
          shouldUnlock = goalsCount >= achievement.threshold;
          break;
        case 'complete_goal':
          const completedGoalsCount = await prisma.goal.count({
            where: { userId, completed: true },
          });
          shouldUnlock = completedGoalsCount >= achievement.threshold;
          break;
        case 'create_journal':
          const journalCount = await prisma.journalEntry.count({ where: { userId } });
          shouldUnlock = journalCount >= achievement.threshold;
          break;
      }

      if (shouldUnlock) {
        const userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
          include: {
            achievement: true,
          },
        });
        newlyUnlocked.push(userAchievement);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Check achievements error:', error);
    return [];
  }
}

export default router;
