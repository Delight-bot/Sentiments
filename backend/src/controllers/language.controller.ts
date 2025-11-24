import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getEnabledLanguages,
  getLanguageConfig,
  validateLanguagePreferences,
  UserLanguagePreferences
} from '../services/language.service';

const prisma = new PrismaClient();

/**
 * Get list of all supported languages
 */
export const getSupportedLanguages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const languages = getEnabledLanguages();

    res.json({
      languages: languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName
      }))
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Failed to get supported languages' });
  }
};

/**
 * Get user's language preferences
 */
export const getUserLanguagePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { preferences: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const preferences = user.preferences as any;
    const languagePrefs: UserLanguagePreferences = preferences?.language || {
      primaryLanguage: 'en',
      secondaryLanguages: [],
      mode: 'single',
      mixRatio: 70
    };

    res.json({ languagePreferences: languagePrefs });
  } catch (error) {
    console.error('Get user language preferences error:', error);
    res.status(500).json({ error: 'Failed to get language preferences' });
  }
};

/**
 * Update user's language preferences
 */
export const updateLanguagePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      primaryLanguage,
      secondaryLanguages,
      mode,
      mixRatio,
      voicePreference
    } = req.body;

    // Validate language preferences
    const validatedPrefs = validateLanguagePreferences({
      primaryLanguage,
      secondaryLanguages,
      mode,
      mixRatio,
      voicePreference
    });

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { preferences: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Merge with existing preferences
    const currentPrefs = (user.preferences as any) || {};
    const updatedPrefs = {
      ...currentPrefs,
      language: validatedPrefs
    };

    // Update user
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        preferences: updatedPrefs
      }
    });

    res.json({
      message: 'Language preferences updated successfully',
      languagePreferences: validatedPrefs
    });
  } catch (error: any) {
    console.error('Update language preferences error:', error);
    res.status(400).json({ error: error.message || 'Failed to update language preferences' });
  }
};

/**
 * Get voice options for a specific language
 */
export const getVoicesForLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { languageCode } = req.params;

    const langConfig = getLanguageConfig(languageCode);
    if (!langConfig) {
      res.status(404).json({ error: 'Language not supported' });
      return;
    }

    res.json({
      language: {
        code: langConfig.code,
        name: langConfig.name,
        nativeName: langConfig.nativeName
      },
      voices: {
        openai: langConfig.voiceIds.openai,
        did: langConfig.voiceIds.did,
        heygen: langConfig.voiceIds.heygen,
        elevenlabs: langConfig.voiceIds.elevenlabs || []
      }
    });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: 'Failed to get voice options' });
  }
};
