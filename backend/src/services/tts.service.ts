import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { getVoiceForLanguage } from './language.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface TTSOptions {
  languageCode?: string;
  voiceId?: string;
  speed?: number;
}

export const generateSpeech = async (
  text: string,
  outputPath: string,
  options: TTSOptions = {}
): Promise<string> => {
  try {
    // Auto-select voice based on language if not specified
    const voice = options.voiceId || getVoiceForLanguage(
      options.languageCode || 'en',
      'openai'
    );

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd', // Use HD model for better multilingual support
      voice: voice as any,
      input: text,
      speed: options.speed || 1.0
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('TTS error:', error);
    throw new Error('Failed to generate speech');
  }
};

export const generateSpeechBuffer = async (
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> => {
  try {
    // Auto-select voice based on language if not specified
    const voice = options.voiceId || getVoiceForLanguage(
      options.languageCode || 'en',
      'openai'
    );

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as any,
      input: text,
      speed: options.speed || 1.0
    });

    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error('TTS buffer error:', error);
    throw new Error('Failed to generate speech buffer');
  }
};
