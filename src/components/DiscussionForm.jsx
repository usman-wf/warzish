import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './DiscussionForm.css';

const DiscussionForm = () => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [likedTweets, setLikedTweets] = useState(new Set());

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3030/api/tweets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTweets(response.data);
      // Initialize liked tweets set
      const userId = localStorage.getItem('userId');
      const likedSet = new Set();
      response.data.forEach(tweet => {
        if (tweet.likes && tweet.likes.some(likeId => likeId.toString() === userId)) {
          likedSet.add(tweet._id);
        }
      });
      setLikedTweets(likedSet);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setError('Failed to fetch tweets');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3030/api/tweets', 
        { content: newTweet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTweets([response.data, ...tweets]);
      setNewTweet('');
    } catch (error) {
      console.error('Error posting tweet:', error);
      setError('Failed to post tweet');
    }
  };

  const handleLike = async (tweetId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log('Before like - User ID:', userId);
      console.log('Before like - Tweet:', tweets.find(t => t._id === tweetId));
      
      const response = await axios.post(`http://localhost:3030/api/tweets/${tweetId}/like`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('After like - Response:', response.data);
      console.log('After like - Likes array:', response.data.likes);
      console.log('After like - User in likes:', response.data.likes.some(id => id.toString() === userId));
      
      setTweets(tweets.map(tweet => 
        tweet._id === tweetId ? response.data : tweet
      ));

      // Update liked tweets set
      setLikedTweets(prev => {
        const newSet = new Set(prev);
        if (newSet.has(tweetId)) {
          newSet.delete(tweetId);
        } else {
          newSet.add(tweetId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking tweet:', error);
      setError('Failed to like tweet');
    }
  };

  const handleComment = async (tweetId) => {
    const comment = commentInputs[tweetId];
    if (!comment || !comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3030/api/tweets/${tweetId}/comment`, 
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTweets(tweets.map(tweet => 
        tweet._id === tweetId ? response.data : tweet
      ));
      // Clear the comment input after successful submission
      setCommentInputs(prev => ({ ...prev, [tweetId]: '' }));
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    }
  };

  const handleCommentInputChange = (tweetId, value) => {
    setCommentInputs(prev => ({ ...prev, [tweetId]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <div className="discussion-wrapper">
          <div className="discussion-main-content">
            <h1>Discussion Form</h1>
            
            {/* New Tweet Form */}
            <form onSubmit={handleSubmit} className="tweet-form">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="Share your thoughts..."
                maxLength={280}
                className="tweet-input"
              />
              <button type="submit" className="tweet-submit-btn">
                Post
              </button>
            </form>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Loading State */}
            {loading ? (
              <div className="loading">Loading tweets...</div>
            ) : (
              /* Tweet List */
              <div className="tweets-list">
                {tweets.length > 0 ? (
                  tweets.map(tweet => (
                    <div key={tweet._id} className="tweet-card">
                      <div className="tweet-header">
                        {/* Removed profile picture */}
                        <div className="tweet-info">
                          <span className="tweet-author">{tweet.author.name}</span>
                          <span className="tweet-date">{formatDate(tweet.createdAt)}</span>
                        </div>
                      </div>
                      <p className="tweet-content">{tweet.content}</p>
                      <div className="tweet-actions">
                        <button
                          onClick={() => handleLike(tweet._id)}
                          className={`like-btn ${tweet.likes && tweet.likes.some(likeId => likeId === localStorage.getItem('userId')) ? 'liked' : ''}`}
                        >
                          <i className="material-icons">favorite</i>
                          <span>{tweet.likes ? tweet.likes.length : 0}</span>
                        </button>
                        <button className="comment-btn">
                          <i className="material-icons">comment</i>
                          <span>{tweet.comments.length}</span>
                        </button>
                      </div>
                      {/* Comments Section */}
                      <div className="comments-section">
                        {/* Comment Input Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleComment(tweet._id);
                          }} 
                          className="comment-form"
                        >
                          <textarea
                            value={commentInputs[tweet._id] || ''}
                            onChange={(e) => handleCommentInputChange(tweet._id, e.target.value)}
                            placeholder="Write a comment..."
                            className="comment-input"
                            maxLength={280}
                          />
                          <button type="submit" className="comment-submit-btn">
                            Comment
                          </button>
                        </form>
                        {/* Existing Comments */}
                        {tweet.comments.map(comment => (
                          <div key={comment._id} className="comment">
                            <div className="comment-content">
                              <span className="comment-author">{comment.author.name}</span>
                              <p>{comment.content}</p>
                              <span className="comment-date">{formatDate(comment.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tweets">No tweets yet. Be the first to post!</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForm;