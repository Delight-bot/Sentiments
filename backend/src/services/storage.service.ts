import fs from 'fs/promises';
import path from 'path';

// Local storage directory (inside container)
const STORAGE_DIR = path.join(process.cwd(), 'uploads', 'storage');
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
  }
}

// Initialize storage directory on module load
ensureStorageDir();

export const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  try {
    await ensureStorageDir();

    const fileContent = await fs.readFile(filePath);
    const destinationPath = path.join(STORAGE_DIR, key);

    // Create subdirectories if needed
    const dir = path.dirname(destinationPath);
    await fs.mkdir(dir, { recursive: true });

    // Copy file to storage
    await fs.writeFile(destinationPath, fileContent);

    // Return local URL
    const url = `${BASE_URL}/uploads/storage/${key}`;
    console.log(`✅ File stored locally: ${key}`);
    return url;
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw new Error('Failed to upload file to local storage');
  }
};

export const uploadBufferToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  try {
    await ensureStorageDir();

    const destinationPath = path.join(STORAGE_DIR, key);

    // Create subdirectories if needed
    const dir = path.dirname(destinationPath);
    await fs.mkdir(dir, { recursive: true });

    // Write buffer to file
    await fs.writeFile(destinationPath, buffer);

    // Return local URL
    const url = `${BASE_URL}/uploads/storage/${key}`;
    console.log(`✅ Buffer stored locally: ${key}`);
    return url;
  } catch (error) {
    console.error('Local storage buffer upload error:', error);
    throw new Error('Failed to upload buffer to local storage');
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const filePath = path.join(STORAGE_DIR, key);
    await fs.unlink(filePath);
    console.log(`🗑️  File deleted: ${key}`);
  } catch (error) {
    console.error('Local storage delete error:', error);
    throw new Error('Failed to delete file from local storage');
  }
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.webm': 'audio/webm',
    '.wav': 'audio/wav',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };
  return contentTypes[ext] || 'application/octet-stream';
}
