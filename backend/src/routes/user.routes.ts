import { Router } from 'express';
import { getProfile, updateProfile, uploadVoiceStory, updateNotificationTimes } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer to preserve file extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, 'audio-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/voice-story', authenticateToken, upload.single('audio'), uploadVoiceStory);
router.put('/notification-times', authenticateToken, updateNotificationTimes);

export default router;
