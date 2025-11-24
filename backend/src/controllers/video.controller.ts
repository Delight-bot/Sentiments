import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { generatePersonalizedContent } from '../services/ai.service';
import { generateVideoFromContent } from '../services/video.service';
import { AvatarVideoService } from '../services/video-generation';
import { getMusicRecommendation } from '../services/music.service';
import { VoiceCloneService } from '../services/voice-clone.service';
import { checkAndUnlockAchievements } from '../routes/achievements.routes';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10, unviewedOnly = 'true', category, search } = req.query;

    const where: any = {
      userId: req.userId,
    };

    if (unviewedOnly === 'true') {
      where.viewed = false;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        favorites: {
          where: { userId: req.userId },
          select: { id: true },
        },
        reactions: {
          where: { userId: req.userId },
          select: { type: true },
        },
      },
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    // Add isFavorite and userReaction to each video
    const videosWithMeta = videos.map((video) => ({
      ...video,
      isFavorite: video.favorites.length > 0,
      userReaction: video.reactions[0]?.type || null,
      favorites: undefined,
      reactions: undefined,
    }));

    res.json({ videos: videosWithMeta });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to get video feed' });
  }
};

export const getVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
};

export const generateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { useAvatar = true } = req.body;

    // Get user info with active voice clone
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        voiceClones: {
          where: { isActive: true, status: 'ready' },
          orderBy: { lastUsedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check for active voice clone
    const activeVoiceClone = (user.preferences as any)?.activeVoiceCloneId
      ? user.voiceClones.find((v: any) => v.id === (user.preferences as any).activeVoiceCloneId)
      : user.voiceClones[0];

    // Generate personalized content
    const contentData = await generatePersonalizedContent(user.voiceStory || '', user.preferences);

    let videoUrl: string;
    let provider = 'legacy';
    let usedClonedVoice = false;

    // Use realistic avatar video generation if enabled
    if (useAvatar) {
      try {
        const style = (user.preferences as any)?.style || 'energetic';
        const musicTrack = getMusicRecommendation(style);

        // Use cloned voice if available
        let voiceId = (user.preferences as any)?.voiceId;

        if (activeVoiceClone) {
          // Generate audio using cloned voice
          const tempDir = path.join(process.cwd(), 'uploads', 'temp');
          await fs.mkdir(tempDir, { recursive: true });
          const clonedAudioPath = path.join(tempDir, `cloned_${Date.now()}.mp3`);

          await VoiceCloneService.generateSpeechWithClonedVoice(
            {
              id: activeVoiceClone.id,
              name: activeVoiceClone.name,
              relationship: activeVoiceClone.relationship || undefined,
              description: activeVoiceClone.description || undefined,
              gender: activeVoiceClone.gender as any,
              language: activeVoiceClone.language,
              provider: activeVoiceClone.provider as any,
              providerId: activeVoiceClone.providerId,
              sampleAudioUrl: activeVoiceClone.sampleAudioUrl || undefined,
              status: activeVoiceClone.status as any,
              createdAt: activeVoiceClone.createdAt
            },
            contentData.content,
            clonedAudioPath
          );

          usedClonedVoice = true;

          // Update usage count
          await prisma.voiceClone.update({
            where: { id: activeVoiceClone.id },
            data: {
              usageCount: { increment: 1 },
              lastUsedAt: new Date()
            }
          });

          // Use legacy video generation with cloned voice
          videoUrl = await generateVideoFromContent(
            { ...contentData, audioPath: clonedAudioPath },
            req.userId!
          );

          // Cleanup
          await fs.unlink(clonedAudioPath).catch(() => {});
          provider = `legacy-cloned-${activeVoiceClone.provider}`;
        } else {
          // Use avatar provider with standard voice
          const avatarResult = await AvatarVideoService.generateMotivationalVideo(
            req.userId!,
            contentData.content,
            {
              style,
              musicTrack,
              voiceId,
              languageCode: contentData.language || 'en'
            }
          );

          videoUrl = avatarResult.videoUrl!;
          provider = avatarResult.provider;
        }
      } catch (avatarError) {
        console.warn('Avatar generation failed, falling back to legacy:', avatarError);
        // Fallback to legacy video generation
        videoUrl = await generateVideoFromContent(contentData, req.userId!);
      }
    } else {
      // Use legacy static image + audio video
      videoUrl = await generateVideoFromContent(contentData, req.userId!);
    }

    // Save to database
    const video = await prisma.video.create({
      data: {
        userId: req.userId!,
        title: contentData.title,
        content: contentData.content,
        videoUrl,
        duration: contentData.duration || 30,
        musicTrack: contentData.musicTrack || 'default.mp3'
      }
    });

    res.status(201).json({
      message: 'Video generated successfully',
      video,
      provider,
      usedClonedVoice,
      voiceCloneName: activeVoiceClone?.name
    });
  } catch (error) {
    console.error('Generate video error:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
};

export const markAsViewed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Get video details
    const video = await prisma.video.findFirst({
      where: { id, userId },
    });

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Mark video as viewed
    await prisma.video.update({
      where: { id },
      data: {
        viewed: true,
        viewedAt: new Date(),
      },
    });

    // Update user stats and streak
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWatchedDate = user.lastWatchedDate ? new Date(user.lastWatchedDate) : null;
    if (lastWatchedDate) {
      lastWatchedDate.setHours(0, 0, 0, 0);
    }

    let currentStreak = user.currentStreak;
    let longestStreak = user.longestStreak;

    if (!lastWatchedDate) {
      // First video ever
      currentStreak = 1;
    } else if (lastWatchedDate.getTime() === today.getTime()) {
      // Already watched today, don't update streak
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastWatchedDate.getTime() === yesterday.getTime()) {
        // Watched yesterday, continue streak
        currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        currentStreak = 1;
      }
    }

    // Update longest streak if needed
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        longestStreak,
        lastWatchedDate: today,
        totalVideosWatched: { increment: 1 },
        totalWatchTime: { increment: video.duration },
      },
    });

    // Check for achievements
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({
      message: 'Video marked as viewed',
      currentStreak,
      longestStreak,
      newAchievements,
    });
  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({ error: 'Failed to mark video as viewed' });
  }
};
