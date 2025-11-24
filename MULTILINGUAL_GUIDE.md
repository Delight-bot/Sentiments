# Multilingual Support Guide

Your Sentiments App now supports **10+ languages** with ability to mix languages (code-switching)!

## Supported Languages

| Language | Code | Native Name | AI Avatar | OpenAI TTS |
|----------|------|-------------|-----------|------------|
| English | `en` | English | ✅ | ✅ |
| Spanish | `es` | Español | ✅ | ✅ |
| French | `fr` | Français | ✅ | ✅ |
| German | `de` | Deutsch | ✅ | ✅ |
| Portuguese | `pt` | Português | ✅ | ✅ |
| Chinese | `zh` | 中文 | ✅ | ✅ |
| Hindi | `hi` | हिन्दी | ✅ | ✅ |
| Arabic | `ar` | العربية | ✅ | ✅ |
| Japanese | `ja` | 日本語 | ✅ | ✅ |
| Korean | `ko` | 한국어 | ✅ | ✅ |

## Features

### 1. Single Language Mode
Videos generated entirely in one language

**Example**: User speaks Spanish
```json
{
  "primaryLanguage": "es",
  "secondaryLanguages": [],
  "mode": "single"
}
```

**Result**: "¡Buenos días! Hoy es un nuevo día lleno de posibilidades..."

### 2. Mixed Language Mode (Code-Switching)
Naturally mixes multiple languages like bilingual people actually speak

**Example**: English + Spanish (Spanglish)
```json
{
  "primaryLanguage": "en",
  "secondaryLanguages": ["es"],
  "mode": "mixed",
  "mixRatio": 70
}
```

**Result**: "Good morning! Remember, you are más fuerte than you think. Every pequeño step counts towards tu sueño..."

## API Endpoints

### Get Supported Languages

```bash
GET /api/languages/supported

Response:
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English"
    },
    {
      "code": "es",
      "name": "Spanish",
      "nativeName": "Español"
    }
    // ... more languages
  ]
}
```

### Get User's Language Preferences

```bash
GET /api/languages/preferences
Authorization: Bearer <token>

Response:
{
  "languagePreferences": {
    "primaryLanguage": "en",
    "secondaryLanguages": ["es"],
    "mode": "mixed",
    "mixRatio": 70,
    "voicePreference": null
  }
}
```

### Update Language Preferences

```bash
PUT /api/languages/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "primaryLanguage": "es",
  "secondaryLanguages": ["en"],
  "mode": "mixed",
  "mixRatio": 60
}

Response:
{
  "message": "Language preferences updated successfully",
  "languagePreferences": {
    "primaryLanguage": "es",
    "secondaryLanguages": ["en"],
    "mode": "mixed",
    "mixRatio": 60
  }
}
```

### Get Available Voices for a Language

```bash
GET /api/languages/es/voices
Authorization: Bearer <token>

Response:
{
  "language": {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Español"
  },
  "voices": {
    "openai": ["nova", "alloy"],
    "did": ["es-ES-ElviraNeural", "es-MX-DaliaNeural"],
    "heygen": ["es-ES-ElviraNeural"],
    "elevenlabs": ["Bella", "Matilda"]
  }
}
```

## How It Works

### 1. User Onboarding
When users record their voice story, the AI detects:
- Language preferences
- Cultural context
- Communication style

### 2. Content Generation
AI generates motivational content in user's preferred language(s):

**Single Mode**:
- 100% primary language
- Natural, fluent content

**Mixed Mode**:
- Primary language (default 70%)
- Secondary languages (30%)
- Natural code-switching
- Culturally appropriate mixing

### 3. Voice & Avatar Selection
System auto-selects:
- Native voice for primary language
- Appropriate accent/dialect
- Natural speech patterns

### 4. Video Generation
- D-ID/HeyGen avatars speak in selected language(s)
- Text overlays in primary language
- Background music remains universal

## Examples

### Spanish Only (Single Mode)

```javascript
// User preference
{
  "primaryLanguage": "es",
  "mode": "single"
}

// Generated content
{
  "title": "Tu Momento",
  "content": "Hoy es tu día para brillar. Cada paso que tomas te acerca más a tus sueños. ¡Tú puedes!"
}

// Voice: Spanish female (es-ES-ElviraNeural)
// Avatar: Spanish-speaking avatar
```

### English + Hindi Mix (Hinglish)

```javascript
// User preference
{
  "primaryLanguage": "hi",
  "secondaryLanguages": ["en"],
  "mode": "mixed",
  "mixRatio": 60
}

// Generated content
{
  "title": "आज का दिन",
  "content": "Good morning! आज का दिन special है। You have the power अपने dreams को achieve करने की। Keep moving forward!"
}

// Voice: Hindi female (hi-IN-SwaraNeural)
// Avatar: Indian avatar
```

### French + English Mix (Franglais)

```javascript
// User preference
{
  "primaryLanguage": "fr",
  "secondaryLanguages": ["en"],
  "mode": "mixed",
  "mixRatio": 70
}

// Generated content
{
  "title": "Ton Potentiel",
  "content": "Bonjour! Remember, tu es capable of amazing things. Chaque jour is a new opportunity pour grandir. Believe in yourself!"
}

// Voice: French female (fr-FR-DeniseNeural)
// Avatar: French-speaking avatar
```

## Configuration

### Language Preferences in User Object

```typescript
// User preferences stored in database
{
  "preferences": {
    "language": {
      "primaryLanguage": "es",
      "secondaryLanguages": ["en"],
      "mode": "mixed",
      "mixRatio": 70,
      "voicePreference": "es-MX-DaliaNeural"  // Optional: specific voice
    },
    "style": "energetic",
    "videoLength": 30
    // ... other preferences
  }
}
```

### Mix Ratio

Controls the balance between languages in mixed mode:

- **90%**: Mostly primary, rare secondary words
- **70%** (recommended): Natural bilingual speech
- **50%**: Equal balance
- **30%**: More secondary than primary

## Best Practices

### 1. Language Detection
When user records voice story, analyze for:
- Primary language
- Code-switching patterns
- Preferred language mix

### 2. Cultural Appropriateness
- Use GPT-4 for better multilingual understanding
- Mix languages naturally (not word-by-word)
- Respect cultural communication norms

### 3. Voice Selection
- Match voice to user's region/dialect
- For Spanish: es-ES (Spain) vs es-MX (Mexico)
- For Portuguese: pt-BR (Brazil) vs pt-PT (Portugal)

### 4. Testing
Test with native speakers:
```bash
# Generate Spanish test video
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"useAvatar": true}'
```

## Troubleshooting

### "Language not supported"
**Solution**: Check the language code matches SUPPORTED_LANGUAGES

```javascript
// Valid codes
"en", "es", "fr", "de", "pt", "zh", "hi", "ar", "ja", "ko"

// Invalid
"eng", "spa", "english"
```

### Voice sounds wrong for language
**Solution**: Specify voice preference

```bash
PUT /api/languages/preferences
{
  "primaryLanguage": "es",
  "voicePreference": "es-MX-DaliaNeural"  # Mexican Spanish
}
```

### Mixed mode sounds unnatural
**Solution**: Adjust mixRatio

```bash
PUT /api/languages/preferences
{
  "mode": "mixed",
  "mixRatio": 80  # More primary language
}
```

## Adding New Languages

To add a new language:

1. Update `language.service.ts`:
```typescript
SUPPORTED_LANGUAGES.your_code = {
  code: 'your_code',
  name: 'Language Name',
  nativeName: 'Native Name',
  voiceIds: {
    openai: ['voice1', 'voice2'],
    did: ['voice-id'],
    heygen: ['voice-id'],
    elevenlabs: []
  },
  enabled: true
};
```

2. Test voice availability with providers
3. Restart backend

## Future Enhancements

- [ ] Auto-detect user's language from voice recording
- [ ] Regional dialect selection (Mexican Spanish vs Spain Spanish)
- [ ] Custom language mixing rules per language pair
- [ ] Multilingual text overlays in videos
- [ ] Language learning mode (teach new words while motivating)

## Cost Impact

Multilingual support uses:
- **GPT-4** instead of GPT-3.5 (better multilingual)
- **TTS-1-HD** instead of TTS-1 (better pronunciation)

Cost per video:
- GPT-4: ~$0.02
- TTS-1-HD: ~$0.015
- D-ID/HeyGen: Same as before

**Total**: ~$0.035/video + avatar costs

## Support

For language-specific issues:
- Check voice IDs in `language.service.ts`
- Test with D-ID/HeyGen documentation
- Verify GPT-4 supports the language

Happy multilingual motivation! 🌍✨
