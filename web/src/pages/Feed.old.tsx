import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Video {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  viewed: boolean;
  createdAt: string;
}

const Feed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/feed');
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewVideo = async () => {
    setGenerating(true);
    try {
      await api.post('/videos/generate');
      await fetchVideos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate video');
    } finally {
      setGenerating(false);
    }
  };

  const markAsViewed = async (videoId: string) => {
    try {
      await api.put(`/videos/${videoId}/viewed`);
      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, viewed: true } : v
      ));
    } catch (error) {
      console.error('Failed to mark video as viewed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">Sentiments</h1>
          <div className="flex gap-4 items-center">
            <span className="text-white">Hi, {user?.name || user?.email}</span>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Your Motivation Feed</h2>
          <button
            onClick={generateNewVideo}
            disabled={generating}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:scale-105 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate New'}
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-300 text-lg mb-4">
              No videos yet. Generate your first motivational video!
            </p>
            <button
              onClick={generateNewVideo}
              disabled={generating}
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden ${
                  video.viewed ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-300">{video.content}</p>
                    </div>
                    {video.viewed && (
                      <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400 px-3 py-1 rounded-full text-sm">
                        Viewed
                      </span>
                    )}
                  </div>

                  <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full rounded-lg"
                      onPlay={() => !video.viewed && markAsViewed(video.id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Duration: {video.duration}s</span>
                    <span>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
