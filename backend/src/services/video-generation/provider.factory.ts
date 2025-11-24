import { VideoProvider, ProviderConfig } from './types';
import { DIDProvider } from './providers/d-id.provider';
import { HeyGenProvider } from './providers/heygen.provider';
import { SoraProvider } from './providers/sora.provider';

/**
 * Video Provider Factory
 * Creates the appropriate video generation provider based on configuration
 * Supports automatic fallback to backup providers
 */
export class VideoProviderFactory {
  private static providers: Map<string, VideoProvider> = new Map();

  /**
   * Get a video provider by name
   * Automatically handles initialization and caching
   */
  static getProvider(name: string): VideoProvider {
    // Check cache first
    if (this.providers.has(name)) {
      return this.providers.get(name)!;
    }

    // Create new provider
    const provider = this.createProvider(name);
    this.providers.set(name, provider);
    return provider;
  }

  /**
   * Get the primary provider with automatic fallback
   */
  static async getPrimaryProvider(): Promise<VideoProvider> {
    const primaryName = process.env.VIDEO_PROVIDER || 'd-id';
    const fallbackName = process.env.VIDEO_FALLBACK_PROVIDER || 'heygen';

    try {
      const primary = this.getProvider(primaryName);

      // Check if primary is available
      if (await primary.isAvailable()) {
        console.log(`Using primary video provider: ${primaryName}`);
        return primary;
      }

      // Fall back to secondary
      console.warn(`Primary provider ${primaryName} unavailable, falling back to ${fallbackName}`);
      const fallback = this.getProvider(fallbackName);

      if (await fallback.isAvailable()) {
        return fallback;
      }

      throw new Error('No video providers available');
    } catch (error) {
      console.error('Provider selection error:', error);

      // Last resort: try any available provider
      return this.getAnyAvailableProvider();
    }
  }

  /**
   * Create a provider instance by name
   */
  private static createProvider(name: string): VideoProvider {
    const config = this.getProviderConfig(name);

    switch (name.toLowerCase()) {
      case 'd-id':
        return new DIDProvider(config);

      case 'heygen':
        return new HeyGenProvider(config);

      case 'sora':
        return new SoraProvider(config);

      default:
        throw new Error(`Unknown video provider: ${name}`);
    }
  }

  /**
   * Get configuration for a specific provider
   */
  private static getProviderConfig(name: string): ProviderConfig {
    const configMap: Record<string, ProviderConfig> = {
      'd-id': {
        apiKey: process.env.D_ID_API_KEY || '',
        timeout: 60000
      },
      'heygen': {
        apiKey: process.env.HEYGEN_API_KEY || '',
        timeout: 60000
      },
      'sora': {
        apiKey: process.env.SORA_API_KEY || process.env.OPENAI_API_KEY || '',
        timeout: 120000
      }
    };

    const config = configMap[name.toLowerCase()];
    if (!config) {
      throw new Error(`No configuration found for provider: ${name}`);
    }

    if (!config.apiKey) {
      throw new Error(`API key not configured for provider: ${name}`);
    }

    return config;
  }

  /**
   * Find any available provider as a last resort
   */
  private static async getAnyAvailableProvider(): Promise<VideoProvider> {
    const providerNames = ['d-id', 'heygen', 'sora'];

    for (const name of providerNames) {
      try {
        const provider = this.getProvider(name);
        if (await provider.isAvailable()) {
          console.log(`Found available provider: ${name}`);
          return provider;
        }
      } catch (error) {
        // Continue to next provider
        console.error(`Provider ${name} failed:`, error);
      }
    }

    throw new Error('No video generation providers are currently available');
  }

  /**
   * Clear provider cache (useful for testing or config changes)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}
