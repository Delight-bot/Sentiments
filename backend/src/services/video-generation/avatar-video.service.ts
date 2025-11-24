import { VideoProviderFactory } from './provider.factory';
import { AvatarVideoRequest, AvatarVideoResponse } from './types';
import { addBackgroundMusic } from '../music.service';
import { uploadToS3 } from '../storage.service';
import path from 'path';
import fs from 'fs/promises';

/**
 * Avatar Video Service
 * High-level service for generating realistic avatar videos
 * Handles provider selection, fallback, and post-processing
 */
export class AvatarVideoService {
  /**
   * Generate a motivational avatar video from a script
   */
  static async generateMotivationalVideo(
    userId: string,
    script: string,
    options: {
      voiceId?: string;
      avatarId?: string;
      style?: 'professional' | 'casual' | 'energetic' | 'calm';
      musicTrack?: string;
      languageCode?: string;
    } = {}
  ): Promise<AvatarVideoResponse> {
    try {
      console.log(`Generating avatar video for user ${userId}`);

      // Get the best available provider
      const provider = await VideoProviderFactory.getPrimaryProvider();

      // Create avatar video request
      const request: AvatarVideoRequest = {
        script,
        voiceId: options.voiceId,
        avatarId: options.avatarId,
        style: options.style || 'energetic',
        duration: this.calculateDuration(script),
        languageCode: options.languageCode || 'en'
      };

      // Generate the avatar video
      const result = await provider.generateAvatar(request);

      // Poll for completion (with timeout)
      const completedVideo = await this.waitForCompletion(
        provider,
        result.videoId,
        120000  // 2 minute timeout
      );

      // Post-processing: Add background music if requested
      if (options.musicTrack && completedVideo.videoUrl) {
        const enhancedVideoUrl = await this.addMusicToVideo(
          completedVideo.videoUrl,
          options.musicTrack,
          userId
        );
        completedVideo.videoUrl = enhancedVideoUrl;
      }

      console.log(`Video generation completed: ${completedVideo.videoId}`);
      return completedVideo;
    } catch (error: any) {
      console.error('Avatar video generation failed:', error);
      throw new Error(`Failed to generate avatar video: ${error.message}`);
    }
  }

  /**
   * Check the status of a video generation job
   */
  static async getVideoStatus(videoId: string, providerName: string): Promise<AvatarVideoResponse> {
    const provider = VideoProviderFactory.getProvider(providerName);
    return provider.getVideoStatus(videoId);
  }

  /**
   * Wait for video generation to complete
   */
  private static async waitForCompletion(
    provider: any,
    videoId: string,
    timeout: number
  ): Promise<AvatarVideoResponse> {
    const startTime = Date.now();
    const pollInterval = 5000;  // Check every 5 seconds

    while (Date.now() - startTime < timeout) {
      const status = await provider.getVideoStatus(videoId);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video generation timed out');
  }

  /**
   * Add background music to the generated video
   */
  private static async addMusicToVideo(
    videoUrl: string,
    musicTrack: string,
    userId: string
  ): Promise<string> {
    try {
      const tempDir = path.join(__dirname, '../../../uploads/temp');
      await fs.mkdir(tempDir, { recursive: true });

      const timestamp = Date.now();
      const outputPath = path.join(tempDir, `final_${userId}_${timestamp}.mp4`);

      // Add music using the music service
      await addBackgroundMusic(videoUrl, musicTrack, outputPath);

      // Upload the enhanced video
      const videoKey = `videos/${userId}/enhanced_${timestamp}.mp4`;
      const enhancedUrl = await uploadToS3(outputPath, videoKey);

      // Cleanup
      await fs.unlink(outputPath).catch(() => {});

      return enhancedUrl;
    } catch (error) {
      console.error('Music addition failed:', error);
      // Return original video URL if music addition fails
      return videoUrl;
    }
  }

  /**
   * Calculate approximate video duration from script length
   */
  private static calculateDuration(script: string): number {
    // Average speaking rate: ~150 words per minute
    const words = script.split(/\s+/).length;
    const minutes = words / 150;
    const seconds = Math.ceil(minutes * 60);

    // Cap at 60 seconds for Instagram Reels format
    return Math.min(seconds + 5, 60);  // Add 5 seconds padding
  }
}
