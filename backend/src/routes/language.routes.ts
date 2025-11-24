import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getSupportedLanguages,
  getUserLanguagePreferences,
  updateLanguagePreferences,
  getVoicesForLanguage
} from '../controllers/language.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all supported languages
router.get('/supported', getSupportedLanguages);

// Get user's language preferences
router.get('/preferences', getUserLanguagePreferences);

// Update user's language preferences
router.put('/preferences', updateLanguagePreferences);

// Get available voices for a specific language
router.get('/:languageCode/voices', getVoicesForLanguage);

export default router;
