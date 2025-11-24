import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { checkAndUnlockAchievements } from './achievements.routes';

const router = Router();
const prisma = new PrismaClient();

// Get all goals
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { completed } = req.query;

    const where: any = { userId };
    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create goal
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { title, description, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    // Check for achievements
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({ goal, newAchievements });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, description, targetDate, completed } = req.body;

    // Check ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null;
    if (completed !== undefined) {
      data.completed = completed;
      if (completed && !existingGoal.completed) {
        data.completedAt = new Date();
      }
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
    });

    // Check for achievements
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({ goal, newAchievements });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.goal.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
