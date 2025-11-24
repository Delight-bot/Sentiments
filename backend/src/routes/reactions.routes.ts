import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Add or update reaction
router.post('/:videoId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;
    const { type } = req.body; // "like", "love", "fire"

    if (!['like', 'love', 'fire'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    // Check if video exists and belongs to user
    const video = await prisma.video.findFirst({
      where: { id: videoId, userId },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Upsert reaction
    const reaction = await prisma.videoReaction.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      update: { type },
      create: {
        userId,
        videoId,
        type,
      },
    });

    res.json({ reaction });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction
router.delete('/:videoId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    await prisma.videoReaction.delete({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Get reaction stats for a video
router.get('/:videoId/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    const reactions = await prisma.videoReaction.groupBy({
      by: ['type'],
      where: { videoId },
      _count: { type: true },
    });

    const userReaction = await prisma.videoReaction.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    res.json({ reactions, userReaction });
  } catch (error) {
    console.error('Get reaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch reaction stats' });
  }
});

export default router;
