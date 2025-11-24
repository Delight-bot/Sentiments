import axios, { AxiosInstance } from 'axios';
import { VideoProvider, AvatarVideoRequest, AvatarVideoResponse, ProviderConfig } from '../types';
import { getVoiceForLanguage } from '../../language.service';

/**
 * D-ID Provider - Realistic AI Avatar Videos
 * D-ID creates photorealistic talking avatars from images and text
 * Best for: Professional, natural-looking avatars
 */
export class DIDProvider implements VideoProvider {
  name = 'd-id';
  private client: AxiosInstance;

  constructor(config: ProviderConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.d-id.com',
      headers: {
        'Authorization': `Basic ${config.apiKey}`,
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
        'did'
      );

      // D-ID API call to create talking avatar
      const response = await this.client.post('/talks', {
        script: {
          type: 'text',
          input: request.script,
          provider: {
            type: 'microsoft',
            voice_id: voiceId
          }
        },
        source_url: request.avatarId || 'https://create-images-results.d-id.com/default-presenter.jpg',
        config: {
          stitch: true,
          result_format: 'mp4'
        }
      });

      return {
        videoId: response.data.id,
        status: 'processing',
        provider: this.name
      };
    } catch (error: any) {
      console.error('D-ID generation error:', error.response?.data || error.message);
      throw new Error(`D-ID generation failed: ${error.message}`);
    }
  }

  async getVideoStatus(videoId: string): Promise<AvatarVideoResponse> {
    try {
      const response = await this.client.get(`/talks/${videoId}`);

      return {
        videoId: response.data.id,
        status: this.mapStatus(response.data.status),
        videoUrl: response.data.result_url,
        duration: response.data.duration,
        provider: this.name
      };
    } catch (error: any) {
      console.error('D-ID status check error:', error.response?.data || error.message);
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/credits');
      return true;
    } catch (error) {
      console.error('D-ID availability check failed:', error);
      return false;
    }
  }

  private mapStatus(status: string): 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'done':
        return 'completed';
      case 'error':
      case 'rejected':
        return 'failed';
      default:
        return 'processing';
    }
  }
}
