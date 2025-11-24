import { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  recording: boolean;
  setRecording: (recording: boolean) => void;
}

const VoiceRecorder = ({ onRecordingComplete, recording, setRecording }: VoiceRecorderProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        {recording && (
          <div className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 font-bold">
            {formatTime(duration)}
          </div>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
            recording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-110 shadow-orange-500/50'
          }`}
        >
          {recording ? (
            <div className="w-10 h-10 bg-white rounded"></div>
          ) : (
            <svg
              className="w-14 h-14 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="text-gray-300 text-center text-lg">
        {recording ? 'Recording... Click to stop' : 'Click to start recording'}
      </p>
    </div>
  );
};

export default VoiceRecorder;
