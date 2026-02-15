import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Copy, Archive, Trash2, Eye } from 'lucide-react';
import { challengeAPI } from '../../../utils/api';

const ChallengeList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, [filter]);

  const fetchChallenges = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await challengeAPI.getAll(params);
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await challengeAPI.duplicate(id);
      fetchChallenges();
      alert('Challenge duplicated successfully!');
    } catch (error) {
      alert('Failed to duplicate challenge');
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this challenge?')) {
      try {
        await challengeAPI.archive(id);
        fetchChallenges();
      } catch (error) {
        alert('Failed to archive challenge');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await challengeAPI.delete(id);
        fetchChallenges();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete challenge');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
          <p className="text-gray-600 mt-1">Create and manage your trading challenges</p>
        </div>
        <Link
          to="/admin/challenges/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Challenge
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex gap-2">
          {['all', 'draft', 'published', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No challenges found. Create your first challenge!</p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.challenge_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{challenge.challenge_type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : challenge.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {challenge.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Size:</span>
                    <span className="font-medium text-gray-900">${challenge.account_size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Entry Fee:</span>
                    <span className="font-medium text-gray-900">${challenge.entry_fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales:</span>
                    <span className="font-medium text-gray-900">{challenge.sales_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-gray-900">${(challenge.total_revenue || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/admin/challenges/edit/${challenge.id}`}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(challenge.id)}
                    className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  {challenge.status !== 'archived' && (
                    <button
                      onClick={() => handleArchive(challenge.id)}
                      className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                  {challenge.status === 'draft' && (
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChallengeList;
