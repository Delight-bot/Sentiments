import admin from 'firebase-admin';

// Initialize Firebase Admin
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    firebaseInitialized = true;
    console.log('Firebase initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export const sendPushNotification = async (
  userId: string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    initializeFirebase();

    // In a real app, you'd fetch the user's FCM token from the database
    // For now, this is a placeholder
    const token = await getUserFCMToken(userId);

    if (!token) {
      console.log(`No FCM token for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {},
      token
    };

    await admin.messaging().send(message);
    console.log(`Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Push notification error:', error);
  }
};

async function getUserFCMToken(userId: string): Promise<string | null> {
  // TODO: Fetch from database
  // For now, return null
  return null;
}

export const sendBulkNotifications = async (
  userIds: string[],
  payload: NotificationPayload
): Promise<void> => {
  await Promise.all(
    userIds.map(userId => sendPushNotification(userId, payload))
  );
};
