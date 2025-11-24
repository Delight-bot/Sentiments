import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { VoiceCloneService, PRESET_VOICE_TEMPLATES } from '../services/voice-clone.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Configure multer for voice sample uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'voice-samples');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const voiceUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * Get all voice clones for a user
 */
export const getUserVoiceClones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const voiceClones = await prisma.voiceClone.findMany({
      where: {
        userId: req.userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ voiceClones });
  } catch (error) {
    console.error('Get voice clones error:', error);
    res.status(500).json({ error: 'Failed to get voice clones' });
  }
};

/**
 * Upload voice samples and create a voice clone
 */
export const createVoiceClone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      name,
      relationship,
      description,
      gender,
      language,
      consentType,
      consentProof
    } = req.body;

    // Validate
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'At least one audio sample is required' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Voice name is required' });
      return;
    }

    // Validate consent
    if (!consentType) {
      res.status(400).json({ error: 'Consent type is required' });
      return;
    }

    // Get file paths
    const audioFiles = files.map(f => f.path);

    // Clone the voice
    const voiceClone = await VoiceCloneService.cloneVoice(req.userId!, {
      name,
      relationship,
      description,
      gender,
      language: language || 'en',
      audioFiles
    });

    // Save to database
    const savedVoiceClone = await prisma.voiceClone.create({
      data: {
        userId: req.userId!,
        name: voiceClone.name,
        relationship: voiceClone.relationship,
        description: voiceClone.description,
        gender: voiceClone.gender,
        language: voiceClone.language,
        provider: voiceClone.provider,
        providerId: voiceClone.providerId,
        sampleAudioUrl: voiceClone.sampleAudioUrl,
        status: voiceClone.status,
        consentGiven: true,
        consentType,
        consentProof
      }
    });

    // Cleanup temporary files
    await Promise.all(audioFiles.map(file => fs.unlink(file).catch(() => {})));

    res.status(201).json({
      message: 'Voice clone created successfully',
      voiceClone: savedVoiceClone
    });
  } catch (error: any) {
    console.error('Create voice clone error:', error);
    res.status(500).json({ error: error.message || 'Failed to create voice clone' });
  }
};

/**
 * Delete a voice clone
 */
export const deleteVoiceClone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get voice clone
    const voiceClone = await prisma.voiceClone.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!voiceClone) {
      res.status(404).json({ error: 'Voice clone not found' });
      return;
    }

    // Delete from provider
    try {
      await VoiceCloneService.deleteVoice({
        id: voiceClone.id,
        name: voiceClone.name,
        relationship: voiceClone.relationship || undefined,
        description: voiceClone.description || undefined,
        gender: voiceClone.gender as any,
        language: voiceClone.language,
        provider: voiceClone.provider as any,
        providerId: voiceClone.providerId,
        sampleAudioUrl: voiceClone.sampleAudioUrl || undefined,
        status: voiceClone.status as any,
        createdAt: voiceClone.createdAt
      });
    } catch (error) {
      console.warn('Provider deletion failed, continuing with local deletion');
    }

    // Mark as inactive (soft delete)
    await prisma.voiceClone.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Voice clone deleted successfully' });
  } catch (error) {
    console.error('Delete voice clone error:', error);
    res.status(500).json({ error: 'Failed to delete voice clone' });
  }
};

/**
 * Test a voice clone by generating sample speech
 */
export const testVoiceClone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Get voice clone
    const voiceClone = await prisma.voiceClone.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!voiceClone) {
      res.status(404).json({ error: 'Voice clone not found' });
      return;
    }

    if (voiceClone.status !== 'ready') {
      res.status(400).json({ error: 'Voice clone is not ready yet' });
      return;
    }

    // Generate sample speech
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const outputPath = path.join(tempDir, `test_${Date.now()}.mp3`);

    await VoiceCloneService.generateSpeechWithClonedVoice(
      {
        id: voiceClone.id,
        name: voiceClone.name,
        relationship: voiceClone.relationship || undefined,
        description: voiceClone.description || undefined,
        gender: voiceClone.gender as any,
        language: voiceClone.language,
        provider: voiceClone.provider as any,
        providerId: voiceClone.providerId,
        sampleAudioUrl: voiceClone.sampleAudioUrl || undefined,
        status: voiceClone.status as any,
        createdAt: voiceClone.createdAt
      },
      text || 'Hello! This is a test of your cloned voice. You are doing amazing!',
      outputPath
    );

    // Send the audio file
    res.sendFile(outputPath, async (err) => {
      // Cleanup after sending
      if (!err) {
        await fs.unlink(outputPath).catch(() => {});
      }
    });
  } catch (error: any) {
    console.error('Test voice clone error:', error);
    res.status(500).json({ error: error.message || 'Failed to test voice clone' });
  }
};

/**
 * Get preset voice templates
 */
export const getVoiceTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ templates: PRESET_VOICE_TEMPLATES });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get voice templates' });
  }
};

/**
 * Get available voice cloning providers
 */
export const getAvailableProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await VoiceCloneService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
};

/**
 * Update active voice clone for user
 */
export const setActiveVoiceClone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify ownership
    const voiceClone = await prisma.voiceClone.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!voiceClone) {
      res.status(404).json({ error: 'Voice clone not found' });
      return;
    }

    // Update user preferences
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    preferences.activeVoiceCloneId = id;

    await prisma.user.update({
      where: { id: req.userId },
      data: { preferences }
    });

    // Update last used
    await prisma.voiceClone.update({
      where: { id },
      data: { lastUsedAt: new Date() }
    });

    res.json({
      message: 'Active voice clone updated',
      voiceCloneId: id
    });
  } catch (error) {
    console.error('Set active voice error:', error);
    res.status(500).json({ error: 'Failed to set active voice clone' });
  }
};
