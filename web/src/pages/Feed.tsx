import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface Video {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  category: string;
  viewed: boolean;
  createdAt: string;
  isFavorite?: boolean;
  userReaction?: string | null;
}

interface DailyQuote {
  quote: string;
  author: string;
}

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalVideosWatched: number;
  weeklyVideos: number;
}

const Feed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedVideoForJournal, setSelectedVideoForJournal] = useState<string | null>(null);
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [categoryFilter, searchQuery]);

  const fetchData = async () => {
    try {
      const [videosRes, statsRes, quoteRes] = await Promise.all([
        api.get('/videos/feed', {
          params: {
            limit: 50,
            unviewedOnly: false,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            search: searchQuery || undefined,
          },
        }),
        api.get('/stats/dashboard'),
        api.get('/quotes/today'),
      ]);

      setVideos(videosRes.data.videos);
      setStats(statsRes.data.stats);
      setDailyQuote(quoteRes.data.quote);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateNewVideo = async () => {
    setGenerating(true);
    try {
      await api.post('/videos/generate');
      showToast('Video generated successfully!', 'success');
      await fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to generate video', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const markAsViewed = async (videoId: string) => {
    try {
      const response = await api.put(`/videos/${videoId}/viewed`);

      // Update local state
      setVideos(videos.map(v => v.id === videoId ? { ...v, viewed: true } : v));

      // Update stats
      if (response.data.currentStreak !== undefined) {
        setStats(prev => prev ? {
          ...prev,
          currentStreak: response.data.currentStreak,
          longestStreak: response.data.longestStreak,
        } : null);
      }

      // Show achievement notifications
      if (response.data.newAchievements && response.data.newAchievements.length > 0) {
        response.data.newAchievements.forEach((achievement: any) => {
          showToast(`🏆 Achievement Unlocked: ${achievement.achievement.name}!`, 'success');
        });
      }

      showToast(`🔥 Streak: ${response.data.currentStreak} days!`, 'success');
    } catch (error) {
      console.error('Failed to mark video as viewed:', error);
    }
  };

  const toggleFavorite = async (videoId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${videoId}`);
        showToast('Removed from favorites', 'info');
      } else {
        await api.post(`/favorites/${videoId}`);
        showToast('Added to favorites!', 'success');
      }

      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, isFavorite: !isFavorite } : v
      ));
    } catch (error) {
      showToast('Failed to update favorites', 'error');
    }
  };

  const addReaction = async (videoId: string, type: string) => {
    try {
      const currentReaction = videos.find(v => v.id === videoId)?.userReaction;

      if (currentReaction === type) {
        // Remove reaction
        await api.delete(`/reactions/${videoId}`);
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, userReaction: null } : v
        ));
      } else {
        // Add/update reaction
        await api.post(`/reactions/${videoId}`, { type });
        setVideos(videos.map(v =>
          v.id === videoId ? { ...v, userReaction: type } : v
        ));
      }
    } catch (error) {
      showToast('Failed to add reaction', 'error');
    }
  };

  const downloadVideo = (videoUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title}.mp4`;
    link.click();
    showToast('Download started!', 'success');
  };

  const shareVideo = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.content,
          url: window.location.href,
        });
        showToast('Shared successfully!', 'success');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const openJournalModal = (videoId: string) => {
    setSelectedVideoForJournal(videoId);
    setShowJournalModal(true);
  };

  const saveJournalEntry = async () => {
    if (!journalContent.trim()) {
      showToast('Please write something', 'error');
      return;
    }

    try {
      await api.post('/journal', {
        content: journalContent,
        mood: journalMood,
        videoId: selectedVideoForJournal,
      });

      showToast('Journal entry saved!', 'success');
      setShowJournalModal(false);
      setJournalContent('');
      setJournalMood('');
      setSelectedVideoForJournal(null);
    } catch (error) {
      showToast('Failed to save journal entry', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading your feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">Sentiments</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Dashboard
            </button>
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Banner */}
        {stats && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-black">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-1">🔥 {stats.currentStreak} Day Streak!</h2>
                <p className="text-sm opacity-80">Keep it going! Longest: {stats.longestStreak} days</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.totalVideosWatched}</div>
                <div className="text-sm opacity-80">Videos Watched</div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Quote */}
        {dailyQuote && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 animate-fade-in">
            <div className="text-yellow-400 text-sm font-semibold mb-2">💡 Daily Quote</div>
            <p className="text-white text-lg italic mb-2">"{dailyQuote.quote}"</p>
            <p className="text-gray-400 text-sm">— {dailyQuote.author}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Categories</option>
            <option value="morning">🌅 Morning</option>
            <option value="afternoon">☀️ Afternoon</option>
            <option value="evening">🌙 Evening</option>
            <option value="workout">💪 Workout</option>
            <option value="reflection">🧘 Reflection</option>
            <option value="general">📺 General</option>
          </select>
          <button
            onClick={generateNewVideo}
            disabled={generating}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? 'Generating...' : '+ New Video'}
          </button>
        </div>

        {/* Videos Grid */}
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
                className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-scale-in hover:border-yellow-400/50 transition"
              >
                <div className="p-6">
                  {/* Video Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-white">{video.title}</h3>
                        {video.viewed && (
                          <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400 px-2 py-1 rounded-full text-xs">
                            ✓ Viewed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300">{video.content}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(video.id, video.isFavorite || false)}
                      className="text-3xl hover:scale-125 transition"
                    >
                      {video.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>

                  {/* Video Player */}
                  <div className="aspect-video bg-black rounded-lg mb-4">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full rounded-lg"
                      onPlay={() => !video.viewed && markAsViewed(video.id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Actions Row */}
                  <div className="flex justify-between items-center">
                    {/* Reactions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addReaction(video.id, 'like')}
                        className={`text-2xl hover:scale-125 transition ${
                          video.userReaction === 'like' ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => addReaction(video.id, 'love')}
                        className={`text-2xl hover:scale-125 transition ${
                          video.userReaction === 'love' ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => addReaction(video.id, 'fire')}
                        className={`text-2xl hover:scale-125 transition ${
                          video.userReaction === 'fire' ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        🔥
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openJournalModal(video.id)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      >
                        📝 Journal
                      </button>
                      <button
                        onClick={() => downloadVideo(video.videoUrl, video.title)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      >
                        ⬇️ Download
                      </button>
                      <button
                        onClick={() => shareVideo(video)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      >
                        🔗 Share
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-between text-sm text-gray-400 mt-4 pt-4 border-t border-gray-800">
                    <span>Duration: {video.duration}s</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-4">Write Journal Entry</h3>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">How are you feeling?</label>
              <select
                value={journalMood}
                onChange={(e) => setJournalMood(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select mood...</option>
                <option value="motivated">💪 Motivated</option>
                <option value="grateful">🙏 Grateful</option>
                <option value="focused">🎯 Focused</option>
                <option value="inspired">✨ Inspired</option>
                <option value="peaceful">😌 Peaceful</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Your thoughts</label>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Write your reflections..."
                rows={6}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowJournalModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveJournalEntry}
                className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:scale-105 transition"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
