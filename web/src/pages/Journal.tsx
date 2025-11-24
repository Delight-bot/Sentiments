import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  createdAt: string;
  video?: {
    id: string;
    title: string;
  };
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journal', { params: { limit: 100 } });
      setEntries(response.data.entries);
    } catch (error) {
      showToast('Failed to load journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setContent('');
    setMood('');
    setEditingEntry(null);
    setShowCreateModal(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setContent(entry.content);
    setMood(entry.mood || '');
    setEditingEntry(entry);
    setShowCreateModal(true);
  };

  const handleSaveEntry = async () => {
    if (!content.trim()) {
      showToast('Please write something', 'error');
      return;
    }

    try {
      if (editingEntry) {
        // Update existing entry
        const response = await api.put(`/journal/${editingEntry.id}`, {
          content,
          mood,
        });

        setEntries(entries.map(e => e.id === editingEntry.id ? response.data.entry : e));
        showToast('Entry updated!', 'success');
      } else {
        // Create new entry
        const response = await api.post('/journal', {
          content,
          mood,
        });

        setEntries([response.data.entry, ...entries]);
        showToast('Entry saved!', 'success');

        // Check for achievements
        if (response.data.newAchievements && response.data.newAchievements.length > 0) {
          response.data.newAchievements.forEach((achievement: any) => {
            showToast(`🏆 Achievement Unlocked: ${achievement.achievement.name}!`, 'success');
          });
        }
      }

      setShowCreateModal(false);
    } catch (error) {
      showToast('Failed to save entry', 'error');
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.delete(`/journal/${entryId}`);
      setEntries(entries.filter(e => e.id !== entryId));
      showToast('Entry deleted', 'info');
    } catch (error) {
      showToast('Failed to delete entry', 'error');
    }
  };

  const getMoodEmoji = (moodValue?: string) => {
    const moods: { [key: string]: string } = {
      motivated: '💪',
      grateful: '🙏',
      focused: '🎯',
      inspired: '✨',
      peaceful: '😌',
    };
    return moodValue ? moods[moodValue] || '📝' : '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">My Journal</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
            >
              Feed
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">📝 Journal Entries</h2>
            <p className="text-gray-400">{entries.length} total entries</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
          >
            + New Entry
          </button>
        </div>

        {/* Entries List */}
        {entries.length > 0 ? (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition animate-scale-in"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getMoodEmoji(entry.mood)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        {entry.video && (
                          <div className="text-xs text-yellow-400">
                            📺 Related to: {entry.video.title}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(entry)}
                          className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="px-3 py-1 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 transition text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-white mb-4">No journal entries yet</h3>
            <p className="text-gray-400 mb-6">
              Start documenting your thoughts and reflections!
            </p>
            <button
              onClick={openCreateModal}
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:scale-105 transition"
            >
              Write Your First Entry
            </button>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">How are you feeling?</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select mood...</option>
                  <option value="motivated">💪 Motivated</option>
                  <option value="grateful">🙏 Grateful</option>
                  <option value="focused">🎯 Focused</option>
                  <option value="inspired">✨ Inspired</option>
                  <option value="peaceful">😌 Peaceful</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Your thoughts *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts and reflections..."
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:scale-105 transition"
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
