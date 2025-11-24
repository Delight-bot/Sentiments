import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { generatePersonalizedContent } from './ai.service';
import { generateVideoFromContent } from './video.service';
import { sendPushNotification } from './notification.service';

const prisma = new PrismaClient();

export const startScheduler = () => {
  // Run every hour to check for scheduled notifications
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled content generation...');
    await generateScheduledContent();
  });

  console.log('Scheduler started');
};

async function generateScheduledContent() {
  try {
    const users = await prisma.user.findMany({
      where: {
        voiceStory: { not: null }
      }
    });

    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    for (const user of users) {
      const times = user.notificationTimes as any;

      // Check if current time matches any notification time
      const shouldGenerate = checkTimeMatch(currentHour, currentMinute, times);

      if (shouldGenerate) {
        // Generate content
        const contentData = await generatePersonalizedContent(
          user.voiceStory || '',
          user.preferences
        );

        // Generate video
        const videoUrl = await generateVideoFromContent(contentData, user.id);

        // Save to database
        const video = await prisma.video.create({
          data: {
            userId: user.id,
            title: contentData.title,
            content: contentData.content,
            videoUrl,
            duration: contentData.duration || 30,
            musicTrack: contentData.musicTrack || 'default.mp3',
            scheduledFor: new Date()
          }
        });

        // Send notification (if user has FCM token)
        await sendPushNotification(user.id, {
          title: 'New Motivation Waiting for You!',
          body: contentData.title,
          data: {
            videoId: video.id,
            type: 'new_video'
          }
        });

        console.log(`Generated video for user ${user.id}`);
      }
    }
  } catch (error) {
    console.error('Scheduled content generation error:', error);
  }
}

function checkTimeMatch(hour: number, minute: number, times: any): boolean {
  if (!times) return false;

  const timeSlots = [times.wake, times.lunch, times.bed];

  for (const timeSlot of timeSlots) {
    if (!timeSlot) continue;

    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);

    // Match if within same hour and within 5 minutes
    if (hour === slotHour && Math.abs(minute - slotMinute) < 5) {
      return true;
    }
  }

  return false;
}
