import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const addContentSource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, title, author, content, sourceUrl, tags } = req.body;

    if (!type || !title || !content) {
      res.status(400).json({ error: 'Type, title, and content are required' });
      return;
    }

    const source = await prisma.contentSource.create({
      data: {
        type,
        title,
        author,
        content,
        sourceUrl,
        tags: tags || []
      }
    });

    res.status(201).json({
      message: 'Content source added successfully',
      source
    });
  } catch (error) {
    console.error('Add content source error:', error);
    res.status(500).json({ error: 'Failed to add content source' });
  }
};

export const getContentSources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, limit = 10 } = req.query;

    const sources = await prisma.contentSource.findMany({
      where: type ? { type: type as string } : undefined,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ sources });
  } catch (error) {
    console.error('Get content sources error:', error);
    res.status(500).json({ error: 'Failed to get content sources' });
  }
};
