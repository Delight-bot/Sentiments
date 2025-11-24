import axios, { AxiosInstance } from 'axios';
import { VideoProvider, AvatarVideoRequest, AvatarVideoResponse, ProviderConfig } from '../types';
import { getVoiceForLanguage } from '../../language.service';

/**
 * HeyGen Provider - AI Avatar Video Generation
 * HeyGen creates highly realistic avatar videos with natural movements
 * Best for: Marketing-style videos, diverse avatar options
 */
export class HeyGenProvider implements VideoProvider {
  name = 'heygen';
  private client: AxiosInstance;

  constructor(config: ProviderConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.heygen.com/v2',
      headers: {
        'X-Api-Key': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: config.timeout || 60000
    });
  }

  async generateAvatar(request: AvatarVideoRequest): Promise<AvatarVideoResponse> {
    try {
      // Auto-select voice based on language if not specified
      const voiceId = request.voiceId || getVoiceForLanguage(
        request.languageCode || 'en',
        'heygen'
      );

      // HeyGen API call to create avatar video
      const response = await this.client.post('/video/generate', {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: request.avatarId || 'josh_lite3_20230714',
            avatar_style: request.style || 'normal'
          },
          voice: {
            type: 'text',
            input_text: request.script,
            voice_id: voiceId
          }
        }],
        dimension: {
          width: 1080,
          height: 1920  // Vertical format for Instagram Reels/Stories
        },
        aspect_ratio: '9:16'
      });

      return {
        videoId: response.data.video_id,
        status: 'processing',
        provider: this.name
      };
    } catch (error: any) {
      console.error('HeyGen generation error:', error.response?.data || error.message);
      throw new Error(`HeyGen generation failed: ${error.message}`);
    }
  }

  async getVideoStatus(videoId: string): Promise<AvatarVideoResponse> {
    try {
      const response = await this.client.get(`/video/status/${videoId}`);

      return {
        videoId: response.data.video_id,
        status: this.mapStatus(response.data.status),
        videoUrl: response.data.video_url,
        thumbnailUrl: response.data.thumbnail_url,
        duration: response.data.duration,
        provider: this.name
      };
    } catch (error: any) {
      console.error('HeyGen status check error:', error.response?.data || error.message);
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/user/remaining_quota');
      return true;
    } catch (error) {
      console.error('HeyGen availability check failed:', error);
      return false;
    }
  }

  private mapStatus(status: string): 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'processing';
    }
  }
}
