import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { transcribeAudio } from '../services/transcription.service';
import { uploadToS3 } from '../services/storage.service';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        voiceStory: true,
        voiceAudioUrl: true,
        notificationTimes: true,
        preferences: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(preferences && { preferences })
      },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true
      }
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadVoiceStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Audio file is required' });
      return;
    }

    // Transcribe audio
    const transcription = await transcribeAudio(req.file.path);

    // Upload to S3
    const audioUrl = await uploadToS3(req.file.path, `voice-stories/${req.userId}.webm`);

    // Delete local file
    await fs.unlink(req.file.path);

    // Update user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        voiceStory: transcription,
        voiceAudioUrl: audioUrl
      },
      select: {
        id: true,
        voiceStory: true,
        voiceAudioUrl: true
      }
    });

    res.json({
      message: 'Voice story uploaded successfully',
      user
    });
  } catch (error) {
    console.error('Upload voice story error:', error);
    res.status(500).json({ error: 'Failed to upload voice story' });
  }
};

export const updateNotificationTimes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wake, lunch, bed } = req.body;

    if (!wake || !lunch || !bed) {
      res.status(400).json({ error: 'All notification times are required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        notificationTimes: { wake, lunch, bed }
      },
      select: {
        id: true,
        notificationTimes: true
      }
    });

    res.json({
      message: 'Notification times updated successfully',
      notificationTimes: user.notificationTimes
    });
  } catch (error) {
    console.error('Update notification times error:', error);
    res.status(500).json({ error: 'Failed to update notification times' });
  }
};
