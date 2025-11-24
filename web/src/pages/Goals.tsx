import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.goals);
    } catch (error) {
      showToast('Failed to load goals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setTargetDate('');
    setEditingGoal(null);
    setShowCreateModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
    setEditingGoal(goal);
    setShowCreateModal(true);
  };

  const handleSaveGoal = async () => {
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      if (editingGoal) {
        // Update existing goal
        const response = await api.put(`/goals/${editingGoal.id}`, {
          title,
          description,
          targetDate: targetDate || null,
        });

        setGoals(goals.map(g => g.id === editingGoal.id ? response.data.goal : g));
        showToast('Goal updated!', 'success');
      } else {
        // Create new goal
        const response = await api.post('/goals', {
          title,
          description,
          targetDate: targetDate || null,
        });

        setGoals([response.data.goal, ...goals]);
        showToast('Goal created!', 'success');

        // Check for achievements
        if (response.data.newAchievements && response.data.newAchievements.length > 0) {
          response.data.newAchievements.forEach((achievement: any) => {
            showToast(`🏆 Achievement Unlocked: ${achievement.achievement.name}!`, 'success');
          });
        }
      }

      setShowCreateModal(false);
    } catch (error) {
      showToast('Failed to save goal', 'error');
    }
  };

  const toggleComplete = async (goal: Goal) => {
    try {
      const response = await api.put(`/goals/${goal.id}`, {
        completed: !goal.completed,
      });

      setGoals(goals.map(g => g.id === goal.id ? response.data.goal : g));

      if (!goal.completed) {
        showToast('🎉 Goal completed!', 'success');

        // Check for achievements
        if (response.data.newAchievements && response.data.newAchievements.length > 0) {
          response.data.newAchievements.forEach((achievement: any) => {
            showToast(`🏆 Achievement Unlocked: ${achievement.achievement.name}!`, 'success');
          });
        }
      } else {
        showToast('Goal marked as incomplete', 'info');
      }
    } catch (error) {
      showToast('Failed to update goal', 'error');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g.id !== goalId));
      showToast('Goal deleted', 'info');
    } catch (error) {
      showToast('Failed to delete goal', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading goals...</div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-yellow-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">My Goals</h1>
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
            <h2 className="text-3xl font-bold text-white mb-2">🎯 Your Goals</h2>
            <p className="text-gray-400">
              {activeGoals.length} active, {completedGoals.length} completed
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition"
          >
            + New Goal
          </button>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Active Goals</h3>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition animate-scale-in"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(goal)}
                      className="text-4xl hover:scale-125 transition mt-1"
                    >
                      ⭕
                    </button>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-gray-300 mb-3">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {goal.targetDate && (
                          <span>📅 Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 transition text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Completed Goals 🎉</h3>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-75"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(goal)}
                      className="text-4xl hover:scale-125 transition mt-1"
                    >
                      ✅
                    </button>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-500 line-through mb-2">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-gray-500 mb-3">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {goal.completedAt && (
                          <span>✅ Completed: {new Date(goal.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">No goals yet</h3>
            <p className="text-gray-400 mb-6">
              Set your first goal and start your journey to success!
            </p>
            <button
              onClick={openCreateModal}
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:scale-105 transition"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details about your goal..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Target Date (optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                onClick={handleSaveGoal}
                className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-lg font-bold hover:scale-105 transition"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
