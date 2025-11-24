import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { checkAndUnlockAchievements } from './achievements.routes';

const router = Router();
const prisma = new PrismaClient();

// Get all journal entries
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };
    if (videoId) where.videoId = videoId as string;

    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.journalEntry.count({ where });

    res.json({ entries, total });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Create journal entry
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { content, mood, videoId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        content,
        mood,
        videoId: videoId || null,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Check for achievements
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({ entry, newAchievements });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Update journal entry
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content, mood } = req.body;

    // Check ownership
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: { content, mood },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({ entry });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete journal entry
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    await prisma.journalEntry.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
