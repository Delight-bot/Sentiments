import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';

const Onboarding = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setRecording(false);
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError('Please record your story first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-story.webm');

      await api.post('/users/voice-story', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload voice story');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">
            Tell Us Your Story
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">
            Record a short message about yourself, your goals, and what motivates you.
            This helps us create personalized content just for you.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="py-8">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            recording={recording}
            setRecording={setRecording}
          />
        </div>

        {audioBlob && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg text-center font-medium">
            ✓ Recording complete! Ready to upload.
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSkip}
            className="flex-1 border-2 border-gray-600 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={!audioBlob || uploading}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading ? 'Uploading...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
