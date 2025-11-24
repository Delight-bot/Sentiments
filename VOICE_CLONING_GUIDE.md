# Voice Cloning Guide

## Overview

Your Sentiments App now supports **voice cloning** - users can upload voice samples and hear motivational messages in the voice of:
- Their **mom**, **dad**, or family members
- Their **best friend** or **mentor**
- **TED speakers**, **role models**, or **public figures**
- **Anyone** they find inspiring!

This is powered by ElevenLabs and Play.ht voice cloning technology.

---

## Features

### 1. Personal Voice Clones
- Upload 1-5 audio samples (3+ recommended)
- AI clones the voice in minutes
- Works in **29 languages** (via ElevenLabs multilingual)
- Preserves emotion, accent, and speaking style

### 2. Code-Switching Support
Voice clones work with mixed-language mode!

**Example**: Mom speaking Spanglish
> "Mijo, you're doing so well! Estoy tan orgullosa de ti. Keep pushing hacia tus sueños!"

### 3. Consent Tracking
- Built-in consent documentation
- Tracks voice relationship (family, friend, public figure)
- Ethical use guidelines

---

## How It Works

### Step 1: Collect Voice Samples

**Best Results** (3-5 samples, 30 seconds - 2 minutes each):
- Clear audio, minimal background noise
- Natural speaking (not reading)
- Different sentences/emotions
- Good examples:
  - Mom giving advice
  - Friend encouraging you
  - Mentor's motivational speech

**Acceptable Sources**:
- ✅ Voice memos
- ✅ Phone recordings
- ✅ Video audio tracks
- ✅ Podcast clips
- ✅ TED Talk audio

### Step 2: Upload & Clone

```bash
POST /api/voice-clones
Content-Type: multipart/form-data

{
  "audioSamples": [file1.mp3, file2.mp3, file3.mp3],
  "name": "My Mom",
  "relationship": "mother",
  "description": "My mom's encouraging voice",
  "gender": "female",
  "language": "en",
  "consentType": "family_member",
  "consentProof": "I have permission from my mother to use her voice"
}
```

### Step 3: Activate Voice Clone

```bash
POST /api/voice-clones/:id/activate
```

### Step 4: Generate Videos

All future videos will use the cloned voice!

```bash
POST /api/videos/generate
{
  "useAvatar": true
}

Response:
{
  "video": {...},
  "usedClonedVoice": true,
  "voiceCloneName": "My Mom",
  "provider": "legacy-cloned-elevenlabs"
}
```

---

## API Endpoints

### Get All Voice Clones

```bash
GET /api/voice-clones
Authorization: Bearer <token>

Response:
{
  "voiceClones": [
    {
      "id": "uuid",
      "name": "My Mom",
      "relationship": "mother",
      "status": "ready",
      "language": "en",
      "provider": "elevenlabs",
      "usageCount": 42,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Create Voice Clone

```bash
POST /api/voice-clones
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- audioSamples: file[] (1-5 audio files)
- name: string (required)
- relationship: string (mother, friend, mentor, role_model)
- description: string
- gender: string (male, female, other)
- language: string (en, es, fr, etc.)
- consentType: string (required)
- consentProof: string

Response:
{
  "message": "Voice clone created successfully",
  "voiceClone": {...}
}
```

### Test Voice Clone

```bash
POST /api/voice-clones/:id/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Hey! This is a test of your cloned voice. You're amazing!"
}

Response: Audio file (MP3)
```

### Activate Voice Clone

```bash
POST /api/voice-clones/:id/activate
Authorization: Bearer <token>

Response:
{
  "message": "Active voice clone updated",
  "voiceCloneId": "uuid"
}
```

### Delete Voice Clone

```bash
DELETE /api/voice-clones/:id
Authorization: Bearer <token>

Response:
{
  "message": "Voice clone deleted successfully"
}
```

### Get Voice Templates

```bash
GET /api/voice-clones/templates
Authorization: Bearer <token>

Response:
{
  "templates": {
    "motivational_coach": {...},
    "gentle_mother": {...},
    "best_friend": {...},
    "wise_mentor": {...}
  }
}
```

---

## Consent & Ethics

### Consent Types

**1. Self (`self`)**
- Your own voice
- No additional consent needed

**2. Family Member (`family_member`)**
- Mom, dad, sibling, etc.
- Requires: Verbal or written permission
- Example proof: "I have my mother's permission to use her voice for personal motivation"

**3. Friend (`friend`)**
- Best friend, mentor, coach
- Requires: Explicit permission
- Example proof: "My friend Sarah gave me permission on Jan 15, 2025"

**4. Public Figure (`public_figure`)**
- Celebrities, motivational speakers
- ⚠️ Use only publicly available content
- ⚠️ Personal use only (not commercial)
- Example proof: "Using publicly available TED Talk audio for personal motivation"

**5. TED Speaker (`ted_speaker`)**
- TED/TEDx speakers
- ⚠️ Use only from official TED videos
- ⚠️ Personal motivation only
- Example proof: "Cloned from Tony Robbins' official TED Talk (link)"

### Ethical Guidelines

✅ **Acceptable Use**:
- Personal motivation and self-improvement
- Hearing encouragement in a loved one's voice
- Learning from role models
- Private, non-commercial use

❌ **Prohibited Use**:
- Impersonation or fraud
- Commercial use without license
- Sharing cloned voices publicly
- Harassment or malicious content
- Violating privacy or copyright

### Best Practices

1. **Always get permission** for private individuals
2. **Use public content** for public figures
3. **Keep it personal** - don't share cloned voices
4. **Respect privacy** - delete unused clones
5. **Be transparent** - document your consent

---

## Real-World Examples

### Example 1: Mom's Voice (Spanglish)

```bash
# 1. Upload 3 voice memos from mom
POST /api/voice-clones
- audioSamples: [mom_advice1.mp3, mom_cooking.mp3, mom_laughing.mp3]
- name: "Mamá"
- relationship: "mother"
- language: "es"
- consentType: "family_member"
- consentProof: "Mi mamá me dio permiso"

# 2. Set language to Spanglish
PUT /api/languages/preferences
{
  "primaryLanguage": "es",
  "secondaryLanguages": ["en"],
  "mode": "mixed",
  "mixRatio": 70
}

# 3. Activate mom's voice
POST /api/voice-clones/{mom-id}/activate

# 4. Generate video
POST /api/videos/generate
```

**Result**:
Video with mom's voice saying:
> "Buenos días mi amor! Today is going to be una gran día. I'm so proud de todo lo que estás haciendo. Keep going, you got this!"

---

### Example 2: Tony Robbins (English)

```bash
# 1. Download 3 clips from Tony's official TED Talk
# (Use audio from YouTube TED channel)

# 2. Upload clips
POST /api/voice-clones
- audioSamples: [tony1.mp3, tony2.mp3, tony3.mp3]
- name: "Tony Robbins"
- relationship: "role_model"
- language: "en"
- consentType: "ted_speaker"
- consentProof: "Cloned from Tony Robbins' official TED Talk: https://www.ted.com/talks/tony_robbins_why_we_do_what_we_do"

# 3. Activate
POST /api/voice-clones/{tony-id}/activate

# 4. Generate
POST /api/videos/generate
```

**Result**:
Tony's voice saying your personalized motivation!

---

### Example 3: Best Friend (Hinglish)

```bash
# 1. Record 3 voice messages from your friend
POST /api/voice-clones
- audioSamples: [friend1.m4a, friend2.m4a, friend3.m4a]
- name: "Priya"
- relationship: "friend"
- language: "hi"
- consentType: "friend"
- consentProof: "Priya gave permission on WhatsApp, Jan 15, 2025"

# 2. Set Hinglish mode
PUT /api/languages/preferences
{
  "primaryLanguage": "hi",
  "secondaryLanguages": ["en"],
  "mode": "mixed"
}

# 3. Activate & generate
POST /api/voice-clones/{priya-id}/activate
POST /api/videos/generate
```

**Result**:
> "Hey yaar! आज तुम कमाल करने वाले हो! You've been working so hard यार, and I'm so proud तुम्हारे progress की! Keep it up!"

---

## Technical Details

### Supported Providers

**1. ElevenLabs** (Recommended)
- **Quality**: Excellent
- **Languages**: 29 languages
- **Speed**: ~2-3 minutes
- **Cost**: ~$0.30/voice clone + $0.18/1000 characters
- **Best For**: Multilingual, high quality

**2. Play.ht**
- **Quality**: Very good
- **Languages**: 15+ languages
- **Speed**: ~5 minutes
- **Cost**: ~$0.50/voice clone + $0.16/1000 characters
- **Best For**: Alternative option

### Audio Requirements

**Format**: MP3, WAV, M4A, OGG
**Size**: Max 10MB per file
**Duration**: 30 seconds - 2 minutes per sample
**Total Samples**: 1-5 files (3+ recommended)
**Quality**: Clear audio, minimal background noise

### Language Support

Voice clones work in all supported languages:
- English, Spanish, French, German, Portuguese
- Chinese, Hindi, Arabic, Japanese, Korean
- And 19 more languages (ElevenLabs)

### Processing Time

- **Upload**: Instant
- **Cloning**: 2-5 minutes
- **Status**: Check `status` field (`processing` → `ready`)
- **First Use**: Immediate after `ready`

---

## Troubleshooting

### "Voice cloning failed"

**Causes**:
- Poor audio quality
- Background noise
- Too short samples
- Invalid format

**Solutions**:
1. Use clear, high-quality audio
2. Provide 3+ samples
3. Each sample 30s - 2min
4. Convert to MP3 if needed

### "Voice sounds robotic"

**Causes**:
- Only 1 sample provided
- All samples sound similar
- Reading vs natural speech

**Solutions**:
1. Provide 3+ samples
2. Use natural, conversational samples
3. Include varied emotions/tones

### "Wrong language/accent"

**Cause**:
- Language mismatch

**Solution**:
1. Set correct `language` when cloning
2. Update language preferences
3. Re-clone with correct language

### "Clone not activating"

**Cause**:
- Status still `processing`

**Solution**:
Wait for `status: "ready"`, then activate

---

## Pricing

### ElevenLabs

**Free Tier**:
- 10,000 characters/month
- 3 custom voices
- 29 languages

**Starter** ($5/month):
- 30,000 characters
- 10 custom voices

**Creator** ($22/month):
- 100,000 characters
- 30 custom voices

**Cost Per Video**:
- ~150 characters/video
- ~$0.01-0.03/video

### Play.ht

**Free Tier**:
- 2,500 words/month
- 2 voice clones

**Creator** ($31/month):
- 24,000 words
- 10 voice clones

---

## Getting API Keys

### ElevenLabs

1. Sign up: https://elevenlabs.io
2. Go to Profile → API Keys
3. Copy key to `.env` → `ELEVENLABS_API_KEY`

### Play.ht

1. Sign up: https://play.ht
2. Go to API Access
3. Copy API Key and User ID
4. Add to `.env`:
   - `PLAYHT_API_KEY`
   - `PLAYHT_USER_ID`

---

## Privacy & Security

1. **Audio Samples**: Stored securely on S3
2. **Voice IDs**: Encrypted in database
3. **Consent Proof**: Stored for compliance
4. **Deletion**: Complete removal from all systems
5. **Usage**: Tracked but private

---

## Future Enhancements

- [ ] Real-time voice cloning (instant)
- [ ] Voice mixing (combine 2 voices)
- [ ] Emotion control (happy, calm, energetic)
- [ ] Age adjustment (younger/older version)
- [ ] Background noise removal
- [ ] Auto-consent verification

---

## Support

- ElevenLabs Docs: https://docs.elevenlabs.io/api-reference/quick-start/introduction
- Play.ht Docs: https://docs.play.ht
- Ethics Guidelines: See below

---

## Ethical Use Agreement

By using voice cloning, you agree to:

1. ✅ Only clone voices you have permission to use
2. ✅ Use clones for personal motivation only
3. ✅ Respect privacy and intellectual property
4. ✅ Delete clones when no longer needed
5. ✅ Never use for fraud, impersonation, or harm

---

Hear your motivation in the voice that matters most to you! 🎙️✨
