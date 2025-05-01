import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeGoal, setActiveGoal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quote, setQuote] = useState({ text: "", author: "" });
    const [socialActivity, setSocialActivity] = useState([]);
    const [workoutGroups, setWorkoutGroups] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Try to load user data from localStorage for immediate display
        try {
            const cachedUserData = localStorage.getItem('userData');
            if (cachedUserData) {
                setUserData(JSON.parse(cachedUserData));
            }
        } catch (error) {
            console.error('Error parsing cached user data:', error);
        }

        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // Fetch user profile data
                const profileResponse = await axios.get('http://localhost:3030/api/user/profile', {
                    headers: { Authorization: token }
                });

                setUserData(profileResponse.data);
                
                // Cache user data in localStorage for other components
                localStorage.setItem('userData', JSON.stringify(profileResponse.data));

                // Fetch goals data
                const goalsResponse = await axios.get('http://localhost:3030/api/user/goals', {
                    headers: { Authorization: token }
                });

                // Find the first active goal
                const firstActiveGoal = goalsResponse.data.find(goal => goal.isActive);
                setActiveGoal(firstActiveGoal);

                // For demonstration purposes - in a real app, these would be API calls
                fetchMotivationalQuote();
                fetchMockSocialData();

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const fetchMotivationalQuote = () => {
        // Mock quotes - in a real app, these might come from an API
        const quotes = [
            { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
            { text: "No matter how slow you go, you're still lapping everyone on the couch.", author: "Unknown" },
            { text: "Strength does not come from the body. It comes from the will.", author: "Gandhi" },
            { text: "The difference between try and triumph is a little umph.", author: "Marvin Phillips" },
            { text: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
            { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" }
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };

    const fetchMockSocialData = () => {
        // Mock social activity data
        setSocialActivity([
            { type: 'post', content: 'Just completed a 5K run!', timestamp: '2 hours ago', likes: 12, comments: 3 },
            { type: 'comment', content: 'Great form on those squats!', postTitle: 'My leg day routine', timestamp: '1 day ago', likes: 4 }
        ]);

        // Mock workout groups
        setWorkoutGroups([
            { id: 1, name: 'Morning Runners', members: 12, nextSession: '06/21/2023, 6:00 AM' },
            { id: 2, name: 'Weekend Warriors', members: 8, nextSession: '06/24/2023, 10:00 AM' }
        ]);
    };

    const calculateProgressPercentage = (goal) => {
        if (!goal || !goal.progressEntries || goal.progressEntries.length === 0) {
            return 0;
        }

        const latestEntry = goal.progressEntries[goal.progressEntries.length - 1];

        if (goal.goalType === 'lose_weight' && goal.targetWeight && goal.startWeight) {
            const totalWeightToLose = goal.startWeight.value - goal.targetWeight.value;
            const weightLostSoFar = goal.startWeight.value - latestEntry.weight.value;

            if (totalWeightToLose <= 0) return 0;
            return Math.min(100, Math.max(0, (weightLostSoFar / totalWeightToLose) * 100));
        }
        else if (goal.goalType === 'gain_weight' && goal.targetWeight && goal.startWeight) {
            const totalWeightToGain = goal.targetWeight.value - goal.startWeight.value;
            const weightGainedSoFar = latestEntry.weight.value - goal.startWeight.value;

            if (totalWeightToGain <= 0) return 0;
            return Math.min(100, Math.max(0, (weightGainedSoFar / totalWeightToGain) * 100));
        }

        return 0;
    };

    const getTimeLeft = (goal) => {
        if (!goal || !goal.targetDate) return 'Not set';

        const targetDate = new Date(goal.targetDate);
        const now = new Date();

        // If target date is past, return "Expired"
        if (targetDate < now) return 'Expired';

        const diffTime = targetDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days left`;
        }

        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} left`;
    };

    if (isLoading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-main loading-state">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="greeting-container">
                        <h1>Dashboard</h1>
                    </div>

                    <div className="profile-header">
                        <div className="notifications">
                            <i className="material-icons">notifications</i>
                        </div>

                        <Link to="/profile" className="profile-link">
                            <div className="profile-picture-header">
                                {userData?.profilePicture ? (
                                    <img
                                        src={`http://localhost:3030${userData.profilePicture.startsWith('/') ? userData.profilePicture : `/${userData.profilePicture}`}`}
                                        alt={userData.name}
                                        onError={(e) => {
                                            console.error("Failed to load profile image:", userData.profilePicture);
                                            e.target.onerror = null;
                                            e.target.parentNode.innerHTML = `<div class="avatar-placeholder">
                                                ${userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                            </div>`;
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                <div className="welcome-section">
                    <div className="welcome-text">
                        <h2>Welcome back, {userData?.name || 'User'}!</h2>
                        <div className="quote-container">
                            <p className="quote">"{quote.text}"</p>
                            <p className="quote-author">- {quote.author}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid-container">
                    <div className="dashboard-grid">
                        {/* Activity Summary Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Activity Summary</h3>
                            </div>
                            <div className="card-content">
                                {activeGoal ? (
                                    <div className="goal-summary">
                                        <div className="goal-info">
                                            <p className="goal-title">
                                                {activeGoal.goalType === 'lose_weight'
                                                    ? 'Weight Loss Goal'
                                                    : 'Weight Gain Goal'
                                                }
                                            </p>
                                            <p className="goal-detail">
                                                Target: {activeGoal.targetWeight.value} {activeGoal.targetWeight.unit}
                                            </p>
                                        </div>

                                        <div className="progress-container">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${calculateProgressPercentage(activeGoal)}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">
                                                {calculateProgressPercentage(activeGoal).toFixed(1)}% Complete
                                            </span>
                                        </div>

                                        <Link to="/goals" className="card-link">
                                            View Goals <i className="material-icons">arrow_forward</i>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <p>No active goals</p>
                                        <Link to="/goals" className="card-link">
                                            Set a Goal <i className="material-icons">add</i>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Workout Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Workouts</h3>
                            </div>
                            <div className="card-content">
                                <div className="workout-summary">
                                    <div className="stat-container">
                                        <div className="stat">
                                            <span className="stat-value">3</span>
                                            <span className="stat-label">Workouts this week</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">120</span>
                                            <span className="stat-label">Minutes active</span>
                                        </div>
                                    </div>

                                    <Link to="/workout" className="card-link">
                                        Track Workout <i className="material-icons">fitness_center</i>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Nutrition Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Nutrition</h3>
                            </div>
                            <div className="card-content">
                                <div className="nutrition-summary">
                                    <div className="stat-container">
                                        <div className="stat">
                                            <span className="stat-value">1,850</span>
                                            <span className="stat-label">Calories today</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">85g</span>
                                            <span className="stat-label">Protein</span>
                                        </div>
                                    </div>

                                    <Link to="/food-database" className="card-link">
                                        Log Food <i className="material-icons">restaurant</i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="social-section">
                        <div className="section-header">
                            <h3>Social Activity</h3>
                        </div>

                        <div className="social-container">
                            <div className="activity-feed">
                                <h4>Recent Activity</h4>
                                {socialActivity.length > 0 ? (
                                    <div className="activity-list">
                                        {socialActivity.map((activity, index) => (
                                            <div key={index} className="activity-item">
                                                <div className="activity-icon">
                                                    <i className="material-icons">
                                                        {activity.type === 'post' ? 'post_add' : 'comment'}
                                                    </i>
                                                </div>
                                                <div className="activity-content">
                                                    <p className="activity-text">
                                                        {activity.type === 'post' ? 'You posted:' : `You commented on "${activity.postTitle}":`}
                                                    </p>
                                                    <p className="activity-message">{activity.content}</p>
                                                    <div className="activity-meta">
                                                        <span className="activity-time">{activity.timestamp}</span>
                                                        <span className="activity-stats">
                                                            {activity.likes} likes · {activity.comments} comments
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-activity">
                                        <p>No recent activity</p>
                                    </div>
                                )}

                                <Link to="/community" className="section-link disabled">
                                    Go to Community <i className="material-icons">arrow_forward</i>
                                    <span className="coming-soon">Coming soon</span>
                                </Link>
                            </div>

                            <div className="workout-groups">
                                <h4>Your Workout Groups</h4>
                                {workoutGroups.length > 0 ? (
                                    <div className="groups-list">
                                        {workoutGroups.map(group => (
                                            <div key={group.id} className="group-item">
                                                <h5 className="group-name">{group.name}</h5>
                                                <div className="group-info">
                                                    <span>{group.members} members</span>
                                                    <span>Next: {group.nextSession}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-groups">
                                        <p>You're not in any workout groups yet</p>
                                    </div>
                                )}

                                <Link to="/social-workout" className="section-link disabled">
                                    Find Workout Partners <i className="material-icons">groups</i>
                                    <span className="coming-soon">Coming soon</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;