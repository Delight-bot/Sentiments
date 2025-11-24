# Quick Start Guide - Sentiments App

## Run Everything with One Command

```bash
docker-compose up
```

That's it! Your app is now running:
- **Web App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: PostgreSQL on port 5432

## What Just Happened?

The system:
1. Started PostgreSQL database
2. Started Node.js backend API server
3. Started React web frontend
4. Connected everything together

## Enable Realistic Avatar Videos

Your app now supports AI-generated avatar videos! To enable:

### Step 1: Get API Keys (Pick One)

**Option A: D-ID (Recommended)**
- Sign up: https://studio.d-id.com
- Get free trial: $5.60 credit (~5-6 videos)
- Go to Settings → API Key

**Option B: HeyGen**
- Sign up: https://app.heygen.com
- Get free trial: 1 credit (~1 minute video)
- Go to Settings → API Keys

### Step 2: Add Keys to .env

Open `.env` file and add your key:

```bash
# For D-ID
D_ID_API_KEY=your-key-here

# OR for HeyGen
HEYGEN_API_KEY=your-key-here
```

### Step 3: Restart Docker

```bash
docker-compose down
docker-compose up
```

## Testing the App

### 1. Create an Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Generate Your First Avatar Video

```bash
# Save your token from the register response
TOKEN="your-jwt-token-here"

# Generate video
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"useAvatar": true}'
```

## Useful Commands

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart After Changes
```bash
docker-compose restart backend
```

### Clean Restart (removes database)
```bash
docker-compose down -v
docker-compose up
```

## What About Sora?

Sora (OpenAI's video AI) is **coming soon** but not available yet. When it launches:

1. Just add your Sora API key to `.env`:
   ```bash
   SORA_API_KEY=your-sora-key-here
   VIDEO_PROVIDER=sora
   ```

2. Restart the app
3. Your videos will automatically upgrade to Sora quality!

The architecture is already built and ready for Sora.

## Video Provider Strategy

```
Primary (D-ID)
    ↓ fails?
Fallback (HeyGen)
    ↓ fails?
Legacy (Static Image + Audio)
```

The system automatically picks the best available option!

## Customization

### Change Video Style

Edit `.env`:
```bash
# Options: professional, casual, energetic, calm
VIDEO_STYLE=energetic
```

### Change Background Music

The system automatically picks music based on style:
- **Energetic**: Hip-hop beats
- **Calm**: Ambient peaceful
- **Professional**: Corporate uplifting
- **Casual**: Friendly acoustic

## Need Help?

1. Check [AVATAR_SETUP.md](./AVATAR_SETUP.md) for detailed avatar setup
2. Check [README.md](./README.md) for full documentation
3. View logs: `docker-compose logs -f backend`

## Cost Breakdown

### Free Tier Usage

- **OpenAI**: $5 free credit (GPT + TTS)
- **D-ID**: $5.60 free credit (~5-6 avatar videos)
- **HeyGen**: 1 free credit (~1 minute of video)

**Total**: Can generate ~10-15 videos completely free!

### After Free Tier

For a personal project generating 3 videos/day:
- D-ID Lite: $5.60/month (~90 videos)
- OR HeyGen Creator: $24/month (~450 videos)
- OpenAI: ~$10/month (GPT + TTS)

**Total**: ~$15-35/month depending on provider

## Architecture Highlights

```
User Voice Input
    ↓
OpenAI Whisper (transcription)
    ↓
OpenAI GPT-4 (personalization)
    ↓
D-ID/HeyGen (avatar video)
    ↓
FFmpeg (music mixing)
    ↓
Instagram-ready vertical video!
```

## Ready to Build?

Start the app:
```bash
docker-compose up
```

Visit: http://localhost:5173

Happy building!
