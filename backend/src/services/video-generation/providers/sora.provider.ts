import axios, { AxiosInstance } from 'axios';
import { VideoProvider, AvatarVideoRequest, AvatarVideoResponse, ProviderConfig } from '../types';

/**
 * Sora Provider - OpenAI's Advanced Video Generation (FUTURE)
 *
 * NOTE: Sora is currently NOT publicly available.
 * This is a placeholder implementation ready for when the API launches.
 *
 * Sora will create highly realistic, physics-accurate video from text prompts
 * Best for: Cinematic quality, complex scenarios, photo-realistic content
 */
export class SoraProvider implements VideoProvider {
  name = 'sora';
  private client: AxiosInstance;

  constructor(config: ProviderConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: config.timeout || 120000  // Longer timeout for video generation
    });
  }

  async generateAvatar(request: AvatarVideoRequest): Promise<AvatarVideoResponse> {
    try {
      // NOTE: This is a PROJECTED API based on OpenAI patterns
      // The actual Sora API may differ when released

      const prompt = this.buildSoraPrompt(request);

      const response = await this.client.post('/sora/generate', {
        prompt,
        duration: request.duration || 30,
        aspect_ratio: '9:16',  // Vertical format for shorts
        quality: 'hd',
        style: request.style || 'realistic'
      });

      return {
        videoId: response.data.id,
        status: 'processing',
        provider: this.name
      };
    } catch (error: any) {
      // Sora not available yet - this is expected
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
        throw new Error('Sora is not yet publicly available. Use D-ID or HeyGen instead.');
      }

      console.error('Sora generation error:', error.response?.data || error.message);
      throw new Error(`Sora generation failed: ${error.message}`);
    }
  }

  async getVideoStatus(videoId: string): Promise<AvatarVideoResponse> {
    try {
      const response = await this.client.get(`/sora/videos/${videoId}`);

      return {
        videoId: response.data.id,
        status: this.mapStatus(response.data.status),
        videoUrl: response.data.url,
        duration: response.data.duration,
        provider: this.name
      };
    } catch (error: any) {
      console.error('Sora status check error:', error.response?.data || error.message);
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    // Sora is not publicly available yet
    // When it launches, this should check the API
    return false;
  }

  private buildSoraPrompt(request: AvatarVideoRequest): string {
    // Build a comprehensive prompt for Sora based on the request
    const styleDescriptions = {
      professional: 'professional, business-like setting with clean background',
      casual: 'casual, friendly atmosphere with warm lighting',
      energetic: 'vibrant, energetic environment with dynamic lighting',
      calm: 'peaceful, serene setting with soft, natural lighting'
    };

    const styleDesc = styleDescriptions[request.style || 'professional'];

    return `Create a motivational video featuring a realistic avatar speaking to camera.
${styleDesc}. The avatar should appear genuine, trustworthy, and encouraging.
High quality cinematography, natural movements, engaging eye contact.
Instagram Reels/Stories format (vertical 9:16).

Voice-over text: "${request.script}"`;
  }

  private mapStatus(status: string): 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'processing';
    }
  }
}
