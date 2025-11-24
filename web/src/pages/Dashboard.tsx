import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalVideosWatched: number;
  totalWatchTime: number;
  weeklyVideos: number;
  favoritesCount: number;
  totalGoals: number;
  completedGoals: number;
  journalEntriesCount: number;
  achievementsCount: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentGoals, setRecentGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, achievementsRes, goalsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/achievements'),
        api.get('/goals', { params: { limit: 5 } }),
      ]);

      setStats(statsRes.data.stats);
      setAchievements(achievementsRes.data.achievements);
      setRecentGoals(goalsRes.data.goals);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading dashboard...</div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">Sentiments Dashboard</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Feed
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Goals
            </button>
            <button
              onClick={() => navigate('/journal')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Journal
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name || 'there'}! 👋</h2>
          <p className="text-gray-400 text-lg">Here's your progress overview</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Current Streak */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-black animate-scale-in">
              <div className="text-5xl mb-2">🔥</div>
              <div className="text-4xl font-bold mb-1">{stats.currentStreak}</div>
              <div className="text-sm opacity-80">Day Streak</div>
              <div className="mt-2 text-xs opacity-70">Longest: {stats.longestStreak} days</div>
            </div>

            {/* Total Videos */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl mb-2">📺</div>
              <div className="text-4xl font-bold text-white mb-1">{stats.totalVideosWatched}</div>
              <div className="text-sm text-gray-400">Videos Watched</div>
              <div className="mt-2 text-xs text-yellow-400">{stats.weeklyVideos} this week</div>
            </div>

            {/* Watch Time */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl mb-2">⏱️</div>
              <div className="text-4xl font-bold text-white mb-1">{formatTime(stats.totalWatchTime)}</div>
              <div className="text-sm text-gray-400">Watch Time</div>
              <div className="mt-2 text-xs text-yellow-400">Time well invested</div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl mb-2">🏆</div>
              <div className="text-4xl font-bold text-white mb-1">{stats.achievementsCount}</div>
              <div className="text-sm text-gray-400">Achievements</div>
              <div className="mt-2 text-xs text-yellow-400">{achievements.length} total available</div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Achievements Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🏆 Achievements
            </h3>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <h4 className="text-yellow-400 font-semibold mb-3">Unlocked ({unlockedAchievements.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedAchievements.slice(0, 6).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-4 text-center animate-scale-in"
                    >
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <div className="text-white font-semibold text-sm mb-1">{achievement.name}</div>
                      <div className="text-gray-400 text-xs">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="text-gray-400 font-semibold mb-3">Locked ({lockedAchievements.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {lockedAchievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center opacity-50"
                    >
                      <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                      <div className="text-gray-300 font-semibold text-sm mb-1">{achievement.name}</div>
                      <div className="text-gray-500 text-xs">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Goals & Stats Section */}
          <div className="space-y-6">
            {/* Goals Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎯 Goals
                </h3>
                <button
                  onClick={() => navigate('/goals')}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>

              {stats && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Progress</span>
                    <span className="text-yellow-400 font-bold">
                      {stats.completedGoals} / {stats.totalGoals}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all"
                      style={{
                        width: `${stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {recentGoals.length > 0 ? (
                <div className="space-y-2">
                  {recentGoals.slice(0, 3).map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="text-2xl">
                        {goal.completed ? '✅' : '⭕'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${goal.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {goal.title}
                        </div>
                        {goal.targetDate && (
                          <div className="text-xs text-gray-400">
                            Due: {new Date(goal.targetDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No goals yet</p>
                  <button
                    onClick={() => navigate('/goals')}
                    className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
                  >
                    Create Your First Goal
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">📊 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favorites</span>
                  <span className="text-white font-bold">{stats?.favoritesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Journal Entries</span>
                  <span className="text-white font-bold">{stats?.journalEntriesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-yellow-400 font-bold">{stats?.weeklyVideos || 0} videos</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/journal')}
                className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                📝 Write Journal Entry
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-8 text-center text-black">
          <h3 className="text-3xl font-bold mb-2">Keep Your Momentum Going! 🚀</h3>
          <p className="text-lg opacity-80 mb-6">
            {stats && stats.currentStreak > 0
              ? `You're on a ${stats.currentStreak}-day streak! Watch a video today to keep it alive.`
              : 'Start your journey with a motivational video today!'}
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition shadow-xl"
          >
            Go to Feed →
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
