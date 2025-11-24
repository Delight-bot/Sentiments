# Sentiments App - Project Structure

## Overview
Self-encouraging app with Instagram-style motivational shorts, personalized through voice onboarding and delivered at optimal times to discourage doomscrolling.

## Tech Stack

### Frontend
- **Web**: React + Vite + TypeScript
- **Mobile**: React Native + Expo
- **Shared**: React Native Web for code sharing
- **UI**: Tailwind CSS (web) + NativeWind (mobile)
- **State Management**: React Context + React Query

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 for videos/audio
- **Authentication**: JWT + bcrypt
- **API**: RESTful + WebSocket for real-time

### AI & Content Generation
- **Text Generation**: OpenAI GPT-4 API
- **Text-to-Speech**: OpenAI TTS or ElevenLabs
- **Voice Transcription**: OpenAI Whisper API
- **Video Generation**: FFmpeg + node-canvas

### Infrastructure
- **Hosting**:
  - Backend: Railway/Render/DigitalOcean
  - Frontend Web: Vercel/Netlify
  - Mobile: Expo EAS
- **Notifications**: Firebase Cloud Messaging
- **Scheduling**: node-cron for timed delivery

## Project Directory Structure

```
Sentiments_App/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── content.controller.ts
│   │   │   ├── video.controller.ts
│   │   │   └── notification.controller.ts
│   │   ├── services/
│   │   │   ├── ai.service.ts          # OpenAI integration
│   │   │   ├── tts.service.ts         # Text-to-speech
│   │   │   ├── transcription.service.ts
│   │   │   ├── video.service.ts       # Video generation
│   │   │   ├── scheduler.service.ts   # Timed notifications
│   │   │   └── storage.service.ts     # S3 uploads
│   │   ├── models/
│   │   │   └── prisma/
│   │   │       └── schema.prisma
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   └── video.routes.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── helpers.ts
│   │   └── index.ts
│   ├── uploads/                       # Temp storage
│   ├── assets/
│   │   └── music/                     # Background music files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   └── VoiceOnboarding.tsx
│   │   │   ├── feed/
│   │   │   │   ├── VideoFeed.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   └── VideoCard.tsx
│   │   │   ├── profile/
│   │   │   │   └── UserProfile.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Loader.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   └── Profile.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useVoiceRecording.ts
│   │   │   └── useVideoFeed.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   └── VoiceOnboarding.tsx
│   │   │   ├── feed/
│   │   │   │   ├── VideoFeed.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   └── VideoCard.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       └── Input.tsx
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useVoiceRecording.ts
│   │   │   └── useVideoFeed.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── notifications.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── App.tsx
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   ├── babel.config.js
│   └── tsconfig.json
│
├── shared/
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── content.types.ts
│   │   └── api.types.ts
│   └── constants/
│       └── config.ts
│
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── FEATURES.md
│
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## Database Schema

### Users Table
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  name              String?
  voiceStory        String?   // Transcribed story
  voiceAudioUrl     String?   // S3 URL
  preferences       Json?     // Content preferences
  notificationTimes Json      // Wake, lunch, bed times
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  videos            Video[]
}
```

### Videos Table
```prisma
model Video {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  content       String   // Motivational text
  videoUrl      String   // S3 URL
  thumbnailUrl  String?
  duration      Int      // seconds
  musicTrack    String?  // Music file used
  viewed        Boolean  @default(false)
  scheduledFor  DateTime?
  createdAt     DateTime @default(now())
}
```

### Content Sources Table
```prisma
model ContentSource {
  id          String   @id @default(uuid())
  type        String   // "ted_talk", "quote", "article"
  title       String
  author      String?
  content     String
  sourceUrl   String?
  tags        String[]
  createdAt   DateTime @default(now())
}
```

## Core Features

### Phase 1: MVP
1. User authentication (signup/login)
2. Voice recording onboarding
3. Basic video generation with text overlays
4. Simple feed display
5. Manual content refresh

### Phase 2: Intelligence
1. AI-powered personalized content generation
2. Voice transcription and analysis
3. Content matching based on user story
4. Multiple music tracks
5. Text-to-speech narration

### Phase 3: Automation
1. Scheduled notifications (wake, lunch, bed)
2. Background video generation
3. Content queue management
4. Usage analytics to prevent doomscrolling

### Phase 4: Enhancement
1. Social features (optional sharing)
2. Progress tracking
3. Customizable notification times
4. More content sources
5. Offline support

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/voice-story` - Upload voice recording
- `PUT /api/users/notification-times` - Set notification schedule

### Content
- `GET /api/videos/feed` - Get personalized video feed
- `GET /api/videos/:id` - Get specific video
- `POST /api/videos/generate` - Trigger video generation
- `PUT /api/videos/:id/viewed` - Mark video as viewed

### Admin (Future)
- `POST /api/content/sources` - Add content source
- `GET /api/content/sources` - List sources

## Environment Variables

```env
# Backend
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...

# Firebase (for notifications)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# URLs
FRONTEND_WEB_URL=http://localhost:5173
FRONTEND_MOBILE_URL=exp://...
```

## Development Workflow

1. **Backend First**: Set up API and database
2. **Web MVP**: Create web interface for testing
3. **Mobile App**: Build React Native version
4. **AI Integration**: Add OpenAI services
5. **Video Generation**: Implement FFmpeg pipeline
6. **Notifications**: Set up scheduling
7. **Polish**: UI/UX improvements
8. **Deploy**: Production deployment

## Next Steps

1. Initialize backend with Express + TypeScript
2. Set up database with Prisma
3. Create basic authentication
4. Initialize web frontend with Vite + React
5. Initialize mobile app with Expo
6. Build voice recording feature
7. Integrate OpenAI for content generation
8. Implement video generation
9. Add notification scheduling
10. Deploy and test
