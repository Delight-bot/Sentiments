import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getUserVoiceClones,
  createVoiceClone,
  deleteVoiceClone,
  testVoiceClone,
  getVoiceTemplates,
  getAvailableProviders,
  setActiveVoiceClone,
  voiceUpload
} from '../controllers/voice-clone.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all voice clones for user
router.get('/', getUserVoiceClones);

// Get voice templates
router.get('/templates', getVoiceTemplates);

// Get available providers
router.get('/providers', getAvailableProviders);

// Create a new voice clone (with file upload)
router.post('/', voiceUpload.array('audioSamples', 5), createVoiceClone);

// Test a voice clone
router.post('/:id/test', testVoiceClone);

// Set active voice clone
router.post('/:id/activate', setActiveVoiceClone);

// Delete a voice clone
router.delete('/:id', deleteVoiceClone);

export default router;
