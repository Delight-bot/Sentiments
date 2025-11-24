import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { generateSpeech } from './tts.service';
import { uploadToS3 } from './storage.service';

interface ContentData {
  title: string;
  content: string;
  duration?: number;
  musicTrack?: string;
  language?: string;
  audioPath?: string;  // Optional pre-generated audio (for cloned voices)
}

export const generateVideoFromContent = async (
  contentData: ContentData,
  userId: string
): Promise<string> => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const imageFramePath = path.join(tempDir, `frame_${timestamp}.png`);
    let audioPath = contentData.audioPath || path.join(tempDir, `audio_${timestamp}.mp3`);
    const outputPath = path.join(tempDir, `video_${timestamp}.mp4`);

    // Generate speech from content with language support (if not already provided)
    if (!contentData.audioPath) {
      await generateSpeech(contentData.content, audioPath, {
        languageCode: contentData.language || 'en'
      });
    }

    // Create visual frame with text overlay
    await createVideoFrame(contentData.title, contentData.content, imageFramePath);

    // Combine image, audio, and background music into video
    await createVideoFromAssets(imageFramePath, audioPath, outputPath, contentData.duration || 30);

    // Upload to S3
    const videoKey = `videos/${userId}/${timestamp}.mp4`;
    const videoUrl = await uploadToS3(outputPath, videoKey);

    // Cleanup temp files
    await cleanupTempFiles([imageFramePath, audioPath, outputPath]);

    return videoUrl;
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error('Failed to generate video');
  }
};

async function createVideoFrame(title: string, content: string, outputPath: string): Promise<void> {
  // Create canvas (1080x1920 for vertical video like Instagram stories)
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Add avatar at the top center
  try {
    // Create a circular avatar placeholder (you can replace with actual avatar images later)
    const avatarX = 540;
    const avatarY = 300;
    const avatarRadius = 120;

    // Draw avatar circle background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw avatar border
    ctx.strokeStyle = '#fbbf24'; // Golden border
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw simple face emoji-style avatar
    ctx.fillStyle = '#667eea';
    // Eyes
    ctx.beginPath();
    ctx.arc(avatarX - 40, avatarY - 20, 15, 0, Math.PI * 2);
    ctx.arc(avatarX + 40, avatarY - 20, 15, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY + 20, 50, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } catch (error) {
    console.error('Avatar drawing error:', error);
  }

  // Add title below avatar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 540, 520);

  // Add content with word wrapping
  ctx.font = '40px Arial';
  const words = content.split(' ');
  let line = '';
  let y = 650;
  const maxWidth = 900;
  const lineHeight = 60;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, 540, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 540, y);

  // Add motivational icon at bottom
  ctx.font = '80px Arial';
  ctx.fillText('✨', 540, 1750);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
}

async function createVideoFromAssets(
  imagePath: string,
  audioPath: string,
  outputPath: string,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop(duration)
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest',
        '-t ' + duration
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

async function cleanupTempFiles(files: string[]): Promise<void> {
  try {
    await Promise.all(files.map(file => fs.unlink(file).catch(() => {})));
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
