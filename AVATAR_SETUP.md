# Realistic Avatar Video Setup Guide

Your Sentiments App now supports **realistic AI avatar videos** using D-ID, HeyGen, and future Sora integration!

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Video Generation System             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  D-ID    │  │  HeyGen  │  │   Sora   │ │
│  │ (Primary)│  │(Fallback)│  │ (Future) │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│         Automatic Provider Selection        │
│         + Fallback Support                  │
│                                             │
└─────────────────────────────────────────────┘
                     ↓
         Background Music Mixing (FFmpeg)
                     ↓
           Instagram Reels Format (9:16)
```

## Features

- **Realistic Avatars**: Photorealistic talking avatars instead of static images
- **Natural Voice**: Text-to-speech with emotion and natural cadence
- **Background Music**: Auto-mixed motivational tracks
- **Smart Fallback**: Automatically switches providers if one fails
- **Sora-Ready**: Drop-in replacement when Sora API launches

## Getting API Keys

### 1. D-ID (Recommended Primary)

**What it does**: Creates photorealistic talking avatars from images

1. Sign up at [https://studio.d-id.com](https://studio.d-id.com)
2. Go to Settings → API Key
3. Create a new API key
4. Copy and paste into `.env` as `D_ID_API_KEY`

**Pricing**:
- Free trial: $5.60 credit (≈5-6 videos)
- Lite: $5.60/month (≈5-6 videos/month)
- Pro: $49/month (≈100 videos/month)

### 2. HeyGen (Recommended Fallback)

**What it does**: High-quality avatar videos with diverse avatar options

1. Sign up at [https://app.heygen.com](https://app.heygen.com)
2. Go to Settings → API Keys
3. Generate new API key
4. Copy and paste into `.env` as `HEYGEN_API_KEY`

**Pricing**:
- Free trial: 1 credit (≈1 minute of video)
- Creator: $24/month (15 credits)
- Business: $72/month (50 credits)

### 3. ElevenLabs (Optional - Better Voice)

**What it does**: Ultra-realistic AI voices

1. Sign up at [https://elevenlabs.io](https://elevenlabs.io)
2. Go to Profile → API Keys
3. Generate new API key
4. Copy and paste into `.env` as `ELEVENLABS_API_KEY`

**Pricing**:
- Free: 10,000 characters/month
- Starter: $5/month (30,000 characters)
- Creator: $22/month (100,000 characters)

### 4. Sora (Future)

**Status**: NOT YET AVAILABLE

When OpenAI releases Sora API access:
1. The system will automatically detect it
2. Just add your Sora API key to `.env`
3. Set `VIDEO_PROVIDER=sora` to use it

## Configuration

Edit your `.env` file:

```bash
# Video Generation - Current Providers
D_ID_API_KEY=your-d-id-api-key-here
HEYGEN_API_KEY=your-heygen-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# Video Generation - Future Provider
SORA_API_KEY=your-sora-api-key-here

# Video Generation Settings
VIDEO_PROVIDER=d-id              # Primary provider
VIDEO_FALLBACK_PROVIDER=heygen   # Backup provider
```

## How It Works

1. **User onboards** with voice recording (their story)
2. **AI generates** personalized motivational content
3. **Avatar video** is created using D-ID/HeyGen
4. **Background music** is automatically mixed in
5. **Video delivered** at scheduled times (morning, lunch, evening)

## Testing Avatar Generation

### Option 1: Via API

```bash
# Generate avatar video
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"useAvatar": true}'
```

### Option 2: Via Code

```typescript
import { AvatarVideoService } from './services/video-generation';

const result = await AvatarVideoService.generateMotivationalVideo(
  userId,
  "You are capable of amazing things! Today is your day to shine.",
  {
    style: 'energetic',
    musicTrack: 'motivational_1'
  }
);

console.log(result.videoUrl);
```

## Switching Providers

The system automatically selects the best available provider:

1. **Primary** (D-ID by default)
2. If primary fails → **Fallback** (HeyGen)
3. If both fail → **Legacy** (static image + audio)

To manually switch:

```bash
# Use HeyGen as primary
VIDEO_PROVIDER=heygen

# Use Sora when available
VIDEO_PROVIDER=sora
```

## Cost Optimization Tips

1. **Start with D-ID free trial** ($5.60 credit)
2. **Set up HeyGen as fallback** for redundancy
3. **Use legacy mode** for testing (no API costs)
4. **Generate videos in batches** during off-peak hours
5. **Cache popular content** to avoid regeneration

## Troubleshooting

### "No video providers available"

**Solution**: Check that at least one API key is set correctly

```bash
# Test D-ID
curl -H "Authorization: Basic YOUR_D_ID_KEY" https://api.d-id.com/credits

# Test HeyGen
curl -H "X-Api-Key: YOUR_HEYGEN_KEY" https://api.heygen.com/v2/user/remaining_quota
```

### "Video generation timed out"

**Solution**: Increase timeout in provider settings (default: 2 minutes)

### Music mixing fails

**Solution**: Ensure FFmpeg is installed

```bash
# Check FFmpeg
ffmpeg -version

# Install if missing (Ubuntu)
sudo apt-get install ffmpeg

# Install if missing (Mac)
brew install ffmpeg

# Install if missing (Windows)
# Download from: https://ffmpeg.org/download.html
```

## What's Next

When **Sora** launches:
1. System automatically detects availability
2. Just add `SORA_API_KEY` to `.env`
3. Videos upgrade to cinematic quality instantly

## Support

- D-ID Docs: https://docs.d-id.com
- HeyGen Docs: https://docs.heygen.com
- ElevenLabs Docs: https://docs.elevenlabs.io

Happy creating!
