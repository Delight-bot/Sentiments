# Voice Cloning Quick Start

## What This Feature Does

Imagine hearing your daily motivation in your **mom's voice**, your **best friend's voice**, or even **Tony Robbins' voice**!

This is now possible with voice cloning. 🎙️

---

## Super Quick Example

### 1. Get ElevenLabs API Key

1. Sign up: https://elevenlabs.io (FREE tier available!)
2. Get API key from Profile → API Keys
3. Add to `.env`:
   ```
   ELEVENLABS_API_KEY=your-key-here
   ```

### 2. Clone Your Mom's Voice

```bash
# Record 3 voice memos from your mom (30s - 2min each)
# Example topics:
# - Mom giving you advice
# - Mom telling a story
# - Mom laughing or talking naturally

# Upload to create clone
curl -X POST http://localhost:3000/api/voice-clones \
  -H "Authorization: Bearer $TOKEN" \
  -F "audioSamples=@mom1.mp3" \
  -F "audioSamples=@mom2.mp3" \
  -F "audioSamples=@mom3.mp3" \
  -F "name=My Mom" \
  -F "relationship=mother" \
  -F "language=en" \
  -F "consentType=family_member" \
  -F "consentProof=My mom gave me permission"
```

### 3. Activate Mom's Voice

```bash
# Get the voice clone ID from previous response
curl -X POST http://localhost:3000/api/voice-clones/{id}/activate \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Generate Video

```bash
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"useAvatar": true}'
```

**Result**: Motivational video in your mom's voice! 🎉

---

## Real Examples

### Example 1: Mom Speaking Spanglish

```bash
# 1. Clone mom's voice (Spanish samples)
POST /api/voice-clones
- audioSamples: [mom1.mp3, mom2.mp3, mom3.mp3]
- name: "Mamá"
- language: "es"

# 2. Set Spanglish mode
PUT /api/languages/preferences
{
  "primaryLanguage": "es",
  "secondaryLanguages": ["en"],
  "mode": "mixed",
  "mixRatio": 70
}

# 3. Activate & generate
POST /api/voice-clones/{id}/activate
POST /api/videos/generate
```

**You'll hear**:
> "Buenos días mi amor! Today is your day para lograr tus sueños. I'm so proud of you, keep going!"

---

### Example 2: Tony Robbins

```bash
# 1. Download audio from Tony's TED Talk
# (Use YouTube downloader for audio only)

# 2. Clone voice
POST /api/voice-clones
- audioSamples: [tony1.mp3, tony2.mp3, tony3.mp3]
- name: "Tony Robbins"
- relationship: "role_model"
- consentType: "ted_speaker"
- consentProof: "From official TED Talk: https://ted.com/talks/..."

# 3. Activate & generate
POST /api/voice-clones/{id}/activate
POST /api/videos/generate
```

**You'll hear Tony's voice** giving YOU personalized motivation!

---

### Example 3: Best Friend (Hinglish)

```bash
# 1. Get WhatsApp voice notes from friend
POST /api/voice-clones
- audioSamples: [friend1.opus, friend2.opus, friend3.opus]
- name: "Priya"
- language: "hi"

# 2. Set Hinglish
PUT /api/languages/preferences
{
  "primaryLanguage": "hi",
  "secondaryLanguages": ["en"],
  "mode": "mixed"
}

# 3. Activate & generate
POST /api/voice-clones/{id}/activate
POST /api/videos/generate
```

**You'll hear**:
> "Yaar, आज तुम amazing हो! Keep pushing तुम्हारे dreams की towards!"

---

## How It Works

```
┌─────────────────────────────────────┐
│  1. Upload 3+ Voice Samples         │
│     (Mom, friend, TED speaker, etc.)│
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. ElevenLabs Clones Voice         │
│     (2-3 minutes)                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Activate Cloned Voice           │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. Generate Videos                 │
│     Uses cloned voice automatically │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  5. Hear Motivation in THEIR Voice! │
└─────────────────────────────────────┘
```

---

## Combined Features

### Voice Clone + Multilingual + Avatar Videos

```bash
# 1. Clone mom's voice (Spanglish speaker)
POST /api/voice-clones [...mom samples...]

# 2. Set Spanglish mode
PUT /api/languages/preferences {Spanglish settings}

# 3. Enable avatar videos
# System will use D-ID/HeyGen for visual + cloned voice for audio

# 4. Generate
POST /api/videos/generate {"useAvatar": true}
```

**Result**:
- **Visual**: AI avatar
- **Voice**: Mom's actual voice
- **Language**: Spanglish (natural code-switching)
- **Format**: Instagram Reels style
- **Music**: Background motivational music

**INCREDIBLE EXPERIENCE!** 🤯

---

## Requirements

### Audio Samples

✅ **Good Examples**:
- Voice memos (iPhone Voice Memos)
- WhatsApp voice notes
- Phone call recordings
- Zoom/meeting audio
- Podcast clips
- TED Talk audio

✅ **Specifications**:
- Format: MP3, WAV, M4A, OGG
- Duration: 30 sec - 2 min per sample
- Count: 1-5 samples (3+ recommended)
- Quality: Clear, minimal background noise

❌ **Bad Examples**:
- Very noisy audio
- Music playing in background
- Multiple people talking
- Robotic/synthesized voices

---

## Pricing

### ElevenLabs Free Tier
- 10,000 characters/month FREE
- 3 custom voice clones
- 29 languages

**Perfect for personal use!**

### Cost Per Video
- ~150 characters per video
- **~66 videos/month on free tier**
- $0 cost for most users!

### If You Need More
- Starter: $5/month (30k chars, ~200 videos)
- Creator: $22/month (100k chars, ~666 videos)

---

## Consent & Ethics

### ✅ Always OK:
- **Your own voice**
- **Family** (with permission)
- **Friends** (with permission)
- **Public figures** (TED, podcasts) - personal use only

### ❌ Never OK:
- Impersonation/fraud
- Commercial use without license
- Sharing clones publicly
- Harassment

### Example Consent:
```json
{
  "consentType": "family_member",
  "consentProof": "My mom gave verbal permission on Jan 15, 2025 to use her voice for my personal motivation app"
}
```

---

## Testing

### Test Before Using

```bash
POST /api/voice-clones/{id}/test
{
  "text": "Hey! This is a test. You're doing amazing!"
}
```

Returns: Audio file with your cloned voice speaking the text

---

## Troubleshooting

### "Voice sounds robotic"
→ Upload 3+ diverse samples

### "Wrong accent/language"
→ Set correct `language` when cloning

### "Clone failed"
→ Check audio quality, use MP3 format

### "Not activating"
→ Wait for `status: "ready"` (2-3 minutes)

---

## API Cheat Sheet

```bash
# List your clones
GET /api/voice-clones

# Create clone
POST /api/voice-clones
(multipart/form-data with audio files)

# Test clone
POST /api/voice-clones/:id/test

# Activate clone
POST /api/voice-clones/:id/activate

# Delete clone
DELETE /api/voice-clones/:id

# Generate video (uses active clone)
POST /api/videos/generate
```

---

## Next Steps

1. **Get ElevenLabs API key** (free tier is fine!)
2. **Record 3 voice samples** from someone inspiring
3. **Upload and clone** their voice
4. **Hear motivation** in THEIR voice!

See [VOICE_CLONING_GUIDE.md](./VOICE_CLONING_GUIDE.md) for complete documentation.

---

**This is the most personal motivation you'll ever receive.** 💙

Imagine your mom's voice telling you:
> "I believe in you. You can do this. I'm so proud of you."

**Make it happen!** 🚀
