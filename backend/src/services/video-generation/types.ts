// Base types for video generation providers

export interface AvatarVideoRequest {
  script: string;
  voiceId?: string;
  avatarId?: string;
  duration?: number;
  backgroundMusic?: string;
  style?: 'professional' | 'casual' | 'energetic' | 'calm';
  languageCode?: string;  // Language code (en, es, fr, etc.)
}

export interface AvatarVideoResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  provider: string;
}

export interface VideoProvider {
  name: string;
  generateAvatar(request: AvatarVideoRequest): Promise<AvatarVideoResponse>;
  getVideoStatus(videoId: string): Promise<AvatarVideoResponse>;
  isAvailable(): Promise<boolean>;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}
