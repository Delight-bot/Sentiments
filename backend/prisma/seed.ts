import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create achievements
  const achievements = [
    {
      name: 'first_video',
      description: 'Watch your first motivational video',
      icon: '🎬',
      requirement: 'watch_videos',
      threshold: 1,
    },
    {
      name: '7_day_streak',
      description: 'Watch videos for 7 days in a row',
      icon: '🔥',
      requirement: 'streak_days',
      threshold: 7,
    },
    {
      name: '30_day_streak',
      description: 'Watch videos for 30 days in a row',
      icon: '💪',
      requirement: 'streak_days',
      threshold: 30,
    },
    {
      name: '100_day_streak',
      description: 'Watch videos for 100 days in a row',
      icon: '👑',
      requirement: 'streak_days',
      threshold: 100,
    },
    {
      name: '10_videos',
      description: 'Watch 10 videos total',
      icon: '📺',
      requirement: 'watch_videos',
      threshold: 10,
    },
    {
      name: '30_videos',
      description: 'Watch 30 videos total',
      icon: '🎯',
      requirement: 'watch_videos',
      threshold: 30,
    },
    {
      name: '100_videos',
      description: 'Watch 100 videos total',
      icon: '🌟',
      requirement: 'watch_videos',
      threshold: 100,
    },
    {
      name: 'early_bird',
      description: 'Watch a morning video',
      icon: '🌅',
      requirement: 'watch_category',
      threshold: 1,
    },
    {
      name: 'night_owl',
      description: 'Watch an evening video',
      icon: '🌙',
      requirement: 'watch_category',
      threshold: 1,
    },
    {
      name: 'goal_setter',
      description: 'Set your first personal goal',
      icon: '🎯',
      requirement: 'create_goal',
      threshold: 1,
    },
    {
      name: 'goal_achiever',
      description: 'Complete your first goal',
      icon: '✅',
      requirement: 'complete_goal',
      threshold: 1,
    },
    {
      name: 'reflective',
      description: 'Write your first journal entry',
      icon: '📝',
      requirement: 'create_journal',
      threshold: 1,
    },
    {
      name: 'dedicated_writer',
      description: 'Write 10 journal entries',
      icon: '📖',
      requirement: 'create_journal',
      threshold: 10,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Created ${achievements.length} achievements`);

  // Create some daily quotes
  const quotes = [
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "motivation"
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "success"
    },
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "mindset"
    },
    {
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "motivation"
    },
    {
      quote: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
      category: "perseverance"
    }
  ];

  for (const quote of quotes) {
    await prisma.dailyQuote.create({
      data: quote,
    });
  }

  console.log(`✅ Created ${quotes.length} daily quotes`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
