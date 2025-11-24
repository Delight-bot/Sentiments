# Sentiments App

A self-encouraging app that delivers personalized motivational content in Instagram-style shorts format, timed to help you stay motivated without doomscrolling.

## Features

- **Realistic AI Avatar Videos** - D-ID, HeyGen & Sora integration
- **Voice Cloning** - Hear motivation in your mom's voice, friend's voice, or role model's voice!
- **10+ Languages Support** - Single language or mixed (code-switching like Spanglish, Hinglish)
- Voice-based personalized onboarding
- AI-generated motivational short videos
- Timed delivery (morning, lunch, evening) to prevent doomscrolling
- Cross-platform (Web + Mobile)
- Instagram Reels/Stories format (9:16 vertical)
- Auto-mixed background music
- Smart provider fallback system

## Tech Stack

- **Frontend**: React (Web) + React Native/Expo (Mobile)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma
- **AI**: OpenAI GPT-4, Whisper, TTS
- **Avatar Videos**: D-ID, HeyGen, Sora (future)
- **Video Processing**: FFmpeg + node-canvas
- **Voice**: OpenAI TTS / ElevenLabs (optional)

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture.

## Quick Start

### Run with Docker (Recommended)

```bash
# Clone and navigate to the project
cd Sentiments_App

# Start everything (database, backend, web)
docker-compose up
```

The app will be available at:
- **Web**: http://localhost:5173
- **API**: http://localhost:3000
- **Database**: localhost:5432

### Avatar Video Setup (Optional but Recommended)

For realistic AI avatar videos, see [AVATAR_SETUP.md](./AVATAR_SETUP.md) for:
- Getting D-ID/HeyGen API keys
- Sora integration (when available)
- Provider configuration

### Multilingual Support

See [MULTILINGUAL_GUIDE.md](./MULTILINGUAL_GUIDE.md) for:
- 10+ supported languages (English, Spanish, French, German, Portuguese, Chinese, Hindi, Arabic, Japanese, Korean)
- Single language or mixed mode (code-switching like Spanglish, Hinglish, Franglais)
- API endpoints for language preferences
- Voice selection per language

### Voice Cloning

**Quick Start**: [VOICE_CLONING_QUICKSTART.md](./VOICE_CLONING_QUICKSTART.md) - Get started in 5 minutes!

See [VOICE_CLONING_GUIDE.md](./VOICE_CLONING_GUIDE.md) for:
- Clone voices from audio samples (your mom, friend, mentor, TED speakers)
- Works in 29 languages (ElevenLabs multilingual)
- Combined with multilingual support (mom speaking Spanglish!)
- Complete API documentation and examples
- Consent tracking and ethical guidelines

### Prerequisites
- Docker & Docker Compose (for easy setup)
- OR Node.js 18+ & PostgreSQL 14+ (for manual setup)
- FFmpeg (for video processing)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma migrate dev
npm run dev
```

### Web Setup
```bash
cd web
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

## Development Roadmap

- [x] Project structure
- [ ] Backend API
- [ ] Database setup
- [ ] Web frontend
- [ ] Mobile app
- [ ] Voice recording
- [ ] AI integration
- [ ] Video generation
- [ ] Notifications

## License

MIT
