import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import { uploadToS3 } from './storage.service';

/**
 * Voice Cloning Service
 * Supports ElevenLabs, Play.ht, and Resemble.ai for voice cloning
 * Allows users to upload voice samples and create custom voices
 */

export interface VoiceCloneMetadata {
  id: string;
  name: string;              // "My Mom", "Tony Robbins", "Best Friend"
  relationship?: string;      // "mother", "friend", "mentor", "role_model"
  description?: string;       // Optional description
  gender?: 'male' | 'female' | 'other';
  language: string;           // Primary language of the voice
  provider: 'elevenlabs' | 'playht' | 'resemble';
  providerId: string;         // ID from the provider
  sampleAudioUrl?: string;    // Original sample URL
  status: 'processing' | 'ready' | 'failed';
  createdAt: Date;
}

export interface VoiceCloneRequest {
  name: string;
  relationship?: string;
  description?: string;
  gender?: 'male' | 'female' | 'other';
  language?: string;
  audioFiles: string[];       // Paths to audio files
}

// ElevenLabs Voice Cloning Provider
class ElevenLabsVoiceCloner {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneMetadata> {
    try {
      const formData = new FormData();
      formData.append('name', request.name);
      formData.append('description', request.description || '');

      // Add audio files
      for (const audioPath of request.audioFiles) {
        const audioBuffer = await fs.readFile(audioPath);
        formData.append('files', audioBuffer, {
          filename: path.basename(audioPath),
          contentType: 'audio/mpeg'
        });
      }

      const response = await this.client.post('/voices/add', formData, {
        headers: formData.getHeaders()
      });

      return {
        id: response.data.voice_id,
        name: request.name,
        relationship: request.relationship,
        description: request.description,
        gender: request.gender,
        language: request.language || 'en',
        provider: 'elevenlabs',
        providerId: response.data.voice_id,
        status: 'ready',
        createdAt: new Date()
      };
    } catch (error: any) {
      console.error('ElevenLabs voice cloning error:', error.response?.data || error.message);
      throw new Error(`Voice cloning failed: ${error.message}`);
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await this.client.delete(`/voices/${voiceId}`);
    } catch (error: any) {
      console.error('ElevenLabs voice deletion error:', error.response?.data || error.message);
      throw new Error(`Voice deletion failed: ${error.message}`);
    }
  }

  async generateSpeech(voiceId: string, text: string, language?: string): Promise<Buffer> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2', // Supports 29 languages!
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('ElevenLabs TTS error:', error.response?.data || error.message);
      throw new Error(`Speech generation failed: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/user');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Play.ht Voice Cloning Provider
class PlayhtVoiceCloner {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.play.ht/api/v2',
      headers: {
        'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        'X-USER-ID': process.env.PLAYHT_USER_ID
      }
    });
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneMetadata> {
    try {
      // Upload sample files
      const sampleFiles = [];
      for (const audioPath of request.audioFiles) {
        const formData = new FormData();
        const audioBuffer = await fs.readFile(audioPath);
        formData.append('file', audioBuffer, path.basename(audioPath));

        const uploadResponse = await this.client.post('/cloned-voices/instant', formData, {
          headers: formData.getHeaders()
        });
        sampleFiles.push(uploadResponse.data.file_url);
      }

      // Create cloned voice
      const response = await this.client.post('/cloned-voices', {
        voice_name: request.name,
        sample_file_urls: sampleFiles
      });

      return {
        id: response.data.id,
        name: request.name,
        relationship: request.relationship,
        description: request.description,
        gender: request.gender,
        language: request.language || 'en',
        provider: 'playht',
        providerId: response.data.id,
        status: 'processing',
        createdAt: new Date()
      };
    } catch (error: any) {
      console.error('Play.ht voice cloning error:', error.response?.data || error.message);
      throw new Error(`Voice cloning failed: ${error.message}`);
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await this.client.delete(`/cloned-voices/${voiceId}`);
    } catch (error: any) {
      console.error('Play.ht voice deletion error:', error.response?.data || error.message);
      throw new Error(`Voice deletion failed: ${error.message}`);
    }
  }

  async generateSpeech(voiceId: string, text: string, language?: string): Promise<Buffer> {
    try {
      const response = await this.client.post('/tts', {
        text,
        voice: voiceId,
        output_format: 'mp3'
      });

      // Download the audio
      const audioResponse = await axios.get(response.data.audio_url, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(audioResponse.data);
    } catch (error: any) {
      console.error('Play.ht TTS error:', error.response?.data || error.message);
      throw new Error(`Speech generation failed: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/user');
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Main Voice Clone Service
 */
export class VoiceCloneService {
  private static elevenLabs = new ElevenLabsVoiceCloner();
  private static playht = new PlayhtVoiceCloner();

  /**
   * Clone a voice from audio samples
   */
  static async cloneVoice(
    userId: string,
    request: VoiceCloneRequest
  ): Promise<VoiceCloneMetadata> {
    try {
      // Validate audio files
      if (!request.audioFiles || request.audioFiles.length === 0) {
        throw new Error('At least one audio sample is required');
      }

      // Recommend 3+ samples for best quality
      if (request.audioFiles.length < 3) {
        console.warn('Voice cloning works best with 3+ audio samples');
      }

      // Choose provider based on availability and preference
      const provider = process.env.VOICE_CLONE_PROVIDER || 'elevenlabs';

      let voiceClone: VoiceCloneMetadata;

      if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
        voiceClone = await this.elevenLabs.cloneVoice(request);
      } else if (provider === 'playht' && process.env.PLAYHT_API_KEY) {
        voiceClone = await this.playht.cloneVoice(request);
      } else {
        throw new Error('No voice cloning provider configured');
      }

      // Upload sample audio to S3 for reference
      if (request.audioFiles.length > 0) {
        const sampleKey = `voice-samples/${userId}/${voiceClone.id}_sample.mp3`;
        const sampleUrl = await uploadToS3(request.audioFiles[0], sampleKey);
        voiceClone.sampleAudioUrl = sampleUrl;
      }

      return voiceClone;
    } catch (error: any) {
      console.error('Voice cloning error:', error);
      throw new Error(`Failed to clone voice: ${error.message}`);
    }
  }

  /**
   * Generate speech using a cloned voice
   */
  static async generateSpeechWithClonedVoice(
    voiceClone: VoiceCloneMetadata,
    text: string,
    outputPath: string
  ): Promise<string> {
    try {
      let audioBuffer: Buffer;

      if (voiceClone.provider === 'elevenlabs') {
        audioBuffer = await this.elevenLabs.generateSpeech(
          voiceClone.providerId,
          text,
          voiceClone.language
        );
      } else if (voiceClone.provider === 'playht') {
        audioBuffer = await this.playht.generateSpeech(
          voiceClone.providerId,
          text,
          voiceClone.language
        );
      } else {
        throw new Error('Unsupported voice clone provider');
      }

      await fs.writeFile(outputPath, audioBuffer);
      return outputPath;
    } catch (error: any) {
      console.error('Cloned voice TTS error:', error);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  /**
   * Delete a cloned voice
   */
  static async deleteVoice(voiceClone: VoiceCloneMetadata): Promise<void> {
    try {
      if (voiceClone.provider === 'elevenlabs') {
        await this.elevenLabs.deleteVoice(voiceClone.providerId);
      } else if (voiceClone.provider === 'playht') {
        await this.playht.deleteVoice(voiceClone.providerId);
      }
    } catch (error: any) {
      console.error('Voice deletion error:', error);
      throw new Error(`Failed to delete voice: ${error.message}`);
    }
  }

  /**
   * Check which providers are available
   */
  static async getAvailableProviders(): Promise<string[]> {
    const providers: string[] = [];

    if (process.env.ELEVENLABS_API_KEY && await this.elevenLabs.isAvailable()) {
      providers.push('elevenlabs');
    }

    if (process.env.PLAYHT_API_KEY && await this.playht.isAvailable()) {
      providers.push('playht');
    }

    return providers;
  }
}

/**
 * Preset voice templates for popular figures
 */
export const PRESET_VOICE_TEMPLATES = {
  motivational_coach: {
    name: 'Motivational Coach',
    description: 'Energetic, inspiring, supportive tone',
    relationship: 'coach',
    gender: 'male' as const
  },
  gentle_mother: {
    name: 'Gentle Mother',
    description: 'Warm, caring, nurturing voice',
    relationship: 'mother',
    gender: 'female' as const
  },
  best_friend: {
    name: 'Best Friend',
    description: 'Casual, friendly, encouraging',
    relationship: 'friend',
    gender: 'female' as const
  },
  wise_mentor: {
    name: 'Wise Mentor',
    description: 'Calm, experienced, guiding voice',
    relationship: 'mentor',
    gender: 'male' as const
  }
};
