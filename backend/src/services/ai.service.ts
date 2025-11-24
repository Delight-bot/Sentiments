import OpenAI from 'openai';
import { UserLanguagePreferences, buildMultilingualPrompt, getLanguageNativeName } from './language.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ContentData {
  title: string;
  content: string;
  duration?: number;
  musicTrack?: string;
  language?: string;
}

export const generatePersonalizedContent = async (
  userStory: string,
  preferences: any
): Promise<ContentData> => {
  try {
    // Extract language preferences
    const langPrefs: UserLanguagePreferences = preferences?.language || {
      primaryLanguage: 'en',
      secondaryLanguages: [],
      mode: 'single'
    };

    const basePrompt = `Based on this user's personal story and goals, generate a short (30 seconds),
    motivational message that feels personal and encouraging. The message should be uplifting
    and actionable.

    User's Story: ${userStory || 'A person seeking daily motivation and encouragement'}

    Preferences: ${JSON.stringify(preferences || {})}

    Create a motivational message that:
    1. Addresses their specific challenges or goals
    2. Provides actionable encouragement
    3. Is concise enough for a 30-second video
    4. Feels personal and authentic

    Return ONLY the motivational text, no extra formatting.`;

    // Build multilingual prompt
    const prompt = buildMultilingualPrompt(langPrefs, basePrompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // GPT-4 is much better at multilingual content
      messages: [
        {
          role: 'system',
          content: `You are a compassionate multilingual life coach creating personalized daily motivational messages. You speak naturally in ${getLanguageNativeName(langPrefs.primaryLanguage)}${langPrefs.secondaryLanguages.length > 0 ? ' and mix languages authentically when appropriate' : ''}.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const content = completion.choices[0].message.content || 'You are capable of amazing things today!';

    // Generate a title in the same language
    const titlePrompt = buildMultilingualPrompt(
      langPrefs,
      `Generate a short, catchy title (max 5 words) for this motivational message: "${content}"`
    );

    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: titlePrompt
        }
      ],
      max_tokens: 20
    });

    const title = titleCompletion.choices[0].message.content || 'Daily Motivation';

    return {
      title: title.replace(/"/g, ''),
      content,
      duration: 30,
      musicTrack: 'motivational_1.mp3',
      language: langPrefs.primaryLanguage
    };
  } catch (error) {
    console.error('AI generation error:', error);

    // Fallback content
    return {
      title: 'Keep Going',
      content: 'Today is a new opportunity to become the person you want to be. Take one step forward, no matter how small.',
      duration: 30,
      musicTrack: 'motivational_1.mp3',
      language: 'en'
    };
  }
};

export const analyzeUserStory = async (transcription: string): Promise<any> => {
  try {
    const prompt = `Analyze this user's story and extract key themes, goals, and challenges
    that can be used to personalize their content feed.

    Story: ${transcription}

    Return a JSON object with:
    - themes: array of key themes
    - goals: array of user's goals
    - challenges: array of challenges they face
    - tone: preferred motivational tone (supportive, energetic, calm, etc.)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Story analysis error:', error);
    return {
      themes: ['motivation', 'personal growth'],
      goals: ['self-improvement'],
      challenges: [],
      tone: 'supportive'
    };
  }
};
