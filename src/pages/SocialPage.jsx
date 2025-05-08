import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SocialFeed from '../components/SocialFeed';
import CollaborativeGoals from '../components/CollaborativeGoals';

const SocialPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'goals') {
      setActiveTab('goals');
    } else {
      setActiveTab('feed');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'feed'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('feed')}
            >
              Activity Feed
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'goals'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('goals')}
            >
              Collaborative Goals
            </button>
          </div>
        </div>

        {activeTab === 'feed' ? <SocialFeed /> : <CollaborativeGoals />}
      </div>
    </div>
  );
};

export default SocialPage; 