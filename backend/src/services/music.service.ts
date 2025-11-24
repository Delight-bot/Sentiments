import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

/**
 * Music Service
 * Handles background music for motivational videos
 * Instagram-style inspirational tracks
 */

// Popular motivational music tracks for Instagram shorts
const MUSIC_LIBRARY = {
  'motivational_1': {
    name: 'Uplifting Ambient',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_d1718372c6.mp3',
    duration: 120,
    mood: 'energetic'
  },
  'motivational_2': {
    name: 'Inspiring Cinematic',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    duration: 120,
    mood: 'calm'
  },
  'motivational_3': {
    name: 'Corporate Success',
    url: 'https://cdn.pixabay.com/audio/2022/03/22/audio_730e05a9ab.mp3',
    duration: 120,
    mood: 'professional'
  },
  'energetic_beats': {
    name: 'Energetic Hip Hop',
    url: 'https://cdn.pixabay.com/audio/2022/11/28/audio_cbc3831a09.mp3',
    duration: 120,
    mood: 'energetic'
  }
};

/**
 * Add background music to a video
 */
export const addBackgroundMusic = async (
  videoPath: string,
  musicTrack: string,
  outputPath: string,
  musicVolume: number = 0.15  // 15% volume so it doesn't overpower speech
): Promise<void> => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Get music file
    const musicPath = await downloadMusicTrack(musicTrack, tempDir);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(musicPath)
        .complexFilter([
          // Lower the music volume
          `[1:a]volume=${musicVolume}[music]`,
          // Mix original audio with background music
          '[0:a][music]amix=inputs=2:duration=shortest[aout]'
        ])
        .outputOptions([
          '-map 0:v',           // Use video from first input
          '-map [aout]',        // Use mixed audio
          '-c:v copy',          // Copy video codec (faster)
          '-c:a aac',           // AAC audio codec
          '-b:a 192k',          // Audio bitrate
          '-shortest'           // Match shortest input duration
        ])
        .output(outputPath)
        .on('end', () => {
          // Cleanup music file
          fs.unlink(musicPath).catch(() => {});
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  } catch (error) {
    console.error('Background music addition error:', error);
    throw new Error('Failed to add background music');
  }
};

/**
 * Download a music track from the library or URL
 */
const downloadMusicTrack = async (
  trackNameOrUrl: string,
  tempDir: string
): Promise<string> => {
  try {
    // Check if it's a library track
    const track = MUSIC_LIBRARY[trackNameOrUrl as keyof typeof MUSIC_LIBRARY];
    const url = track ? track.url : trackNameOrUrl;

    const timestamp = Date.now();
    const musicPath = path.join(tempDir, `music_${timestamp}.mp3`);

    // Download the music file
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    await fs.writeFile(musicPath, response.data);
    return musicPath;
  } catch (error) {
    console.error('Music download error:', error);
    throw new Error('Failed to download music track');
  }
};

/**
 * Get a music track recommendation based on mood/style
 */
export const getMusicRecommendation = (
  style: 'professional' | 'casual' | 'energetic' | 'calm' = 'energetic'
): string => {
  const recommendations = {
    professional: 'motivational_3',
    casual: 'motivational_1',
    energetic: 'energetic_beats',
    calm: 'motivational_2'
  };

  return recommendations[style];
};

/**
 * List all available music tracks
 */
export const listMusicTracks = () => {
  return Object.entries(MUSIC_LIBRARY).map(([key, track]) => ({
    id: key,
    name: track.name,
    mood: track.mood,
    duration: track.duration
  }));
};
