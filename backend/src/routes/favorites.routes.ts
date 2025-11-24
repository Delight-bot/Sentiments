import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all favorites
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        video: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/:videoId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    // Check if video exists and belongs to user
    const video = await prisma.video.findFirst({
      where: { id: videoId, userId },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Video already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        videoId,
      },
      include: {
        video: true,
      },
    });

    res.json({ favorite });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:videoId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
