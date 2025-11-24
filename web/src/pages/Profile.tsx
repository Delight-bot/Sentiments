import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [wake, setWake] = useState('08:00');
  const [lunch, setLunch] = useState('12:00');
  const [bed, setBed] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profile = response.data.user;
      setName(profile.name || '');
      if (profile.notificationTimes) {
        setWake(profile.notificationTimes.wake || '08:00');
        setLunch(profile.notificationTimes.lunch || '12:00');
        setBed(profile.notificationTimes.bed || '21:00');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/users/profile', { name });
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/users/notification-times', { wake, lunch, bed });
      setMessage('Notification times updated successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update notification times');
    } finally {
      setSaving(false);
    }
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
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 text-white border border-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition"
          >
            Back to Feed
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">Profile Settings</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('success')
              ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
              : 'bg-red-900/50 text-red-300 border-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Notification Times */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Notification Schedule
          </h3>
          <p className="text-gray-300 mb-4">
            Choose when you want to receive your daily motivational videos
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Morning (Wake Up)</label>
              <input
                type="time"
                value={wake}
                onChange={(e) => setWake(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Afternoon (Lunch)</label>
              <input
                type="time"
                value={lunch}
                onChange={(e) => setLunch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Evening (Before Bed)</label>
              <input
                type="time"
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Notification Times'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
