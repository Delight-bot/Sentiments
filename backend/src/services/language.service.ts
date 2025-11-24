/**
 * Language Service
 * Handles multilingual content generation and voice support
 * Supports mixing languages (code-switching) or single language mode
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  voiceIds: {
    openai: string[];      // OpenAI TTS voices
    did: string[];         // D-ID voices
    heygen: string[];      // HeyGen voices
    elevenlabs?: string[]; // ElevenLabs voices (if available)
  };
  enabled: boolean;
}

/**
 * Supported languages with native voice support
 */
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    voiceIds: {
      openai: ['alloy', 'echo', 'fable', 'nova', 'shimmer'],
      did: ['en-US-JennyNeural', 'en-US-GuyNeural', 'en-US-AriaNeural'],
      heygen: ['en-US-AriaNeural', 'en-US-JennyNeural'],
      elevenlabs: ['Rachel', 'Adam', 'Antoni', 'Arnold']
    },
    enabled: true
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    voiceIds: {
      openai: ['nova', 'alloy'],
      did: ['es-ES-ElviraNeural', 'es-MX-DaliaNeural', 'es-US-AlonsoNeural'],
      heygen: ['es-ES-ElviraNeural', 'es-MX-DaliaNeural'],
      elevenlabs: ['Bella', 'Matilda']
    },
    enabled: true
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    voiceIds: {
      openai: ['alloy', 'nova'],
      did: ['fr-FR-DeniseNeural', 'fr-FR-HenriNeural', 'fr-CA-SylvieNeural'],
      heygen: ['fr-FR-DeniseNeural', 'fr-CA-SylvieNeural'],
      elevenlabs: ['Charlotte', 'Serena']
    },
    enabled: true
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    voiceIds: {
      openai: ['alloy', 'fable'],
      did: ['de-DE-KatjaNeural', 'de-DE-ConradNeural'],
      heygen: ['de-DE-KatjaNeural'],
      elevenlabs: ['Daniel', 'Lily']
    },
    enabled: true
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    voiceIds: {
      openai: ['nova', 'echo'],
      did: ['pt-BR-FranciscaNeural', 'pt-PT-RaquelNeural'],
      heygen: ['pt-BR-FranciscaNeural'],
      elevenlabs: ['Elli', 'Callum']
    },
    enabled: true
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    voiceIds: {
      openai: ['alloy', 'nova'],
      did: ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural'],
      heygen: ['zh-CN-XiaoxiaoNeural'],
      elevenlabs: ['Grace', 'Thomas']
    },
    enabled: true
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    voiceIds: {
      openai: ['alloy', 'nova'],
      did: ['hi-IN-SwaraNeural', 'hi-IN-MadhurNeural'],
      heygen: ['hi-IN-SwaraNeural'],
      elevenlabs: []
    },
    enabled: true
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    voiceIds: {
      openai: ['alloy', 'echo'],
      did: ['ar-SA-ZariyahNeural', 'ar-EG-SalmaNeural'],
      heygen: ['ar-SA-ZariyahNeural'],
      elevenlabs: []
    },
    enabled: true
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    voiceIds: {
      openai: ['alloy', 'shimmer'],
      did: ['ja-JP-NanamiNeural', 'ja-JP-KeitaNeural'],
      heygen: ['ja-JP-NanamiNeural'],
      elevenlabs: []
    },
    enabled: true
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    voiceIds: {
      openai: ['alloy', 'nova'],
      did: ['ko-KR-SunHiNeural', 'ko-KR-InJoonNeural'],
      heygen: ['ko-KR-SunHiNeural'],
      elevenlabs: []
    },
    enabled: true
  }
};

export interface UserLanguagePreferences {
  primaryLanguage: string;        // Main language code
  secondaryLanguages: string[];   // Additional languages
  mode: 'single' | 'mixed';       // Use one language or mix
  mixRatio?: number;              // 0-100, percentage of primary language when mixing (default 70)
  voicePreference?: string;       // Specific voice ID to use
}

/**
 * Get language configuration
 */
export const getLanguageConfig = (code: string): LanguageConfig | null => {
  return SUPPORTED_LANGUAGES[code] || null;
};

/**
 * Get all enabled languages
 */
export const getEnabledLanguages = (): LanguageConfig[] => {
  return Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.enabled);
};

/**
 * Get voice ID for a language and provider
 */
export const getVoiceForLanguage = (
  languageCode: string,
  provider: 'openai' | 'did' | 'heygen' | 'elevenlabs',
  gender?: 'male' | 'female'
): string => {
  const config = getLanguageConfig(languageCode);
  if (!config) {
    return SUPPORTED_LANGUAGES.en.voiceIds[provider]?.[0] || '';
  }

  const voices = config.voiceIds[provider];
  if (!voices || voices.length === 0) {
    // Fallback to English
    return SUPPORTED_LANGUAGES.en.voiceIds[provider]?.[0] || '';
  }

  return voices[0]; // Return first voice by default
};

/**
 * Validate user language preferences
 */
export const validateLanguagePreferences = (
  preferences: Partial<UserLanguagePreferences>
): UserLanguagePreferences => {
  const primary = preferences.primaryLanguage || 'en';
  const secondary = preferences.secondaryLanguages || [];

  // Ensure primary language is supported
  if (!SUPPORTED_LANGUAGES[primary]) {
    throw new Error(`Unsupported primary language: ${primary}`);
  }

  // Ensure secondary languages are supported
  const validSecondary = secondary.filter(code => SUPPORTED_LANGUAGES[code]);

  return {
    primaryLanguage: primary,
    secondaryLanguages: validSecondary,
    mode: preferences.mode || 'single',
    mixRatio: preferences.mixRatio || 70,
    voicePreference: preferences.voicePreference
  };
};

/**
 * Get language name in its native form
 */
export const getLanguageNativeName = (code: string): string => {
  const config = getLanguageConfig(code);
  return config?.nativeName || code.toUpperCase();
};

/**
 * Build a prompt instruction for multilingual content
 */
export const buildMultilingualPrompt = (
  preferences: UserLanguagePreferences,
  basePrompt: string
): string => {
  const primaryLang = SUPPORTED_LANGUAGES[preferences.primaryLanguage];

  if (preferences.mode === 'single') {
    return `${basePrompt}

IMPORTANT: Generate the entire response in ${primaryLang.name} (${primaryLang.nativeName}) only.`;
  }

  // Mixed mode
  const secondaryLangs = preferences.secondaryLanguages
    .map(code => {
      const lang = SUPPORTED_LANGUAGES[code];
      return `${lang.name} (${lang.nativeName})`;
    })
    .join(', ');

  const mixRatio = preferences.mixRatio ?? 70;
  return `${basePrompt}

IMPORTANT: Generate a natural, code-switching response mixing these languages:
- Primary language (${mixRatio}%): ${primaryLang.name} (${primaryLang.nativeName})
- Secondary languages (${100 - mixRatio}%): ${secondaryLangs}

Make it feel natural and authentic, like how bilingual people actually speak. Use language mixing where it feels most impactful and culturally appropriate.`;
};
