import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import '../styles/Goals.css';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [newGoal, setNewGoal] = useState({
        goalType: 'lose_weight',
        targetWeight: { value: '', unit: 'kg' },
        targetBodyFatPercentage: '',
        timeframe: 3
    });
    const [progressEntry, setProgressEntry] = useState({
        weight: { value: '', unit: 'kg' },
        bodyFatPercentage: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [calendarView, setCalendarView] = useState({
        startDate: subMonths(new Date(), 2),
        endDate: addMonths(new Date(), 2)
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetchGoals();
        fetchUserProfile();
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:3030/api/user/profile', {
                headers: { Authorization: token }
            });
            setUserProfile(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('Failed to load profile data');
        }
    };

    const fetchGoals = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3030/api/user/goals', {
                headers: { Authorization: token }
            });

            setGoals(response.data);

            // If there are goals, select the first active one by default
            const activeGoals = response.data.filter(goal => goal.isActive);
            if (activeGoals.length > 0) {
                setSelectedGoal(activeGoals[0]);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast.error('Failed to load goals data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoalChange = (e) => {
        const { name, value } = e.target;

        if (name === 'targetWeightValue') {
            setNewGoal({
                ...newGoal,
                targetWeight: { ...newGoal.targetWeight, value: parseFloat(value) || '' }
            });
        } else if (name === 'targetWeightUnit') {
            setNewGoal({
                ...newGoal,
                targetWeight: { ...newGoal.targetWeight, unit: value }
            });
        } else {
            setNewGoal({
                ...newGoal,
                [name]: name === 'targetBodyFatPercentage' || name === 'timeframe'
                    ? parseFloat(value) || ''
                    : value
            });
        }
    };

    const handleProgressChange = (e) => {
        const { name, value } = e.target;

        if (name === 'weightValue') {
            setProgressEntry({
                ...progressEntry,
                weight: { ...progressEntry.weight, value: parseFloat(value) || '' }
            });
        } else if (name === 'weightUnit') {
            setProgressEntry({
                ...progressEntry,
                weight: { ...progressEntry.weight, unit: value }
            });
        } else {
            setProgressEntry({
                ...progressEntry,
                [name]: name === 'bodyFatPercentage' ? parseFloat(value) || '' : value
            });
        }
    };

    const calculateProgressPercentage = (goal) => {
        if (!goal || !goal.progressEntries || goal.progressEntries.length === 0) {
            return 0;
        }

        const latestEntry = goal.progressEntries[goal.progressEntries.length - 1];

        if (goal.goalType === 'lose_weight' && goal.targetWeight && goal.startWeight) {
            const startWeight = parseFloat(goal.startWeight.value || 0);
            const targetWeight = parseFloat(goal.targetWeight.value || 0);
            const currentWeight = parseFloat(latestEntry.weight.value || 0);
            
            const totalWeightToLose = startWeight - targetWeight;
            const weightLostSoFar = startWeight - currentWeight;

            if (totalWeightToLose <= 0) return 0;
            return Math.min(100, Math.max(0, (weightLostSoFar / totalWeightToLose) * 100));
        }
        else if (goal.goalType === 'gain_weight' && goal.targetWeight && goal.startWeight) {
            const startWeight = parseFloat(goal.startWeight.value || 0);
            const targetWeight = parseFloat(goal.targetWeight.value || 0);
            const currentWeight = parseFloat(latestEntry.weight.value || 0);
            
            const totalWeightToGain = targetWeight - startWeight;
            const weightGainedSoFar = currentWeight - startWeight;

            if (totalWeightToGain <= 0) return 0;
            return Math.min(100, Math.max(0, (weightGainedSoFar / totalWeightToGain) * 100));
        }

        return 0;
    };

    // For the calendar heatmap
    const getCalendarData = (goal) => {
        if (!goal || !goal.progressEntries || goal.progressEntries.length === 0) {
            return [];
        }
        
        return goal.progressEntries.map(entry => ({
            date: entry.date.split('T')[0],
            count: 1,
            weight: entry.weight.value,
            bodyFat: entry.bodyFatPercentage
        }));
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

    const handleSubmitGoal = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // If user has set a starting weight in profile, use that instead of current weight
            let useStartingWeight = null;
            if (userProfile && userProfile.startingWeight && userProfile.startingWeight.value) {
                useStartingWeight = userProfile.startingWeight;
            }

            const response = await axios.post('http://localhost:3030/api/user/goals', {
                goalType: newGoal.goalType,
                targetWeight: newGoal.targetWeight,
                targetBodyFatPercentage: newGoal.targetBodyFatPercentage,
                timeframe: newGoal.timeframe,
                startWeight: useStartingWeight
            }, {
                headers: { Authorization: token }
            });

            toast.success('Goal created successfully');
            setGoals([...goals, response.data.goal]);
            setSelectedGoal(response.data.goal);
            setShowForm(false);
            setNewGoal({
                goalType: 'lose_weight',
                targetWeight: { value: '', unit: 'kg' },
                targetBodyFatPercentage: '',
                timeframe: 3
            });
        } catch (error) {
            console.error('Error creating goal:', error);
            toast.error('Failed to create goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitProgress = async (e) => {
        e.preventDefault();
        if (!selectedGoal) return;

        setIsSubmitting(true);

        try {
            await axios.post(`http://localhost:3030/api/user/goals/${selectedGoal._id}/progress`, {
                weight: progressEntry.weight,
                bodyFatPercentage: progressEntry.bodyFatPercentage,
                date: progressEntry.date ? new Date(progressEntry.date) : new Date()
            }, {
                headers: { Authorization: token }
            });

            toast.success('Progress updated successfully');
            fetchGoals(); // Refresh goals to get updated progress
            setShowProgressForm(false);
            setProgressEntry({
                weight: { value: '', unit: 'kg' },
                bodyFatPercentage: '',
                date: format(new Date(), 'yyyy-MM-dd')
            });
        } catch (error) {
            console.error('Error updating progress:', error);
            toast.error('Failed to update progress');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="goals-container">
                <Sidebar />
                <Navbar />
                <div className="loading">Loading goals...</div>
            </div>
        );
    }

    return (
        <div className="goals-container">
            <Sidebar />
            <Navbar />
            <div className="goals-content">
                <h1>Fitness Goals & Progress</h1>

                <div className="goals-grid">
                    <div className="goals-sidebar">
                        <h2>My Goals</h2>

                        {userProfile && userProfile.weight && userProfile.weight.value && (
                            <div className="current-weight">
                                <h3>Current Weight</h3>
                                <div className="current-weight-value">
                                    {userProfile.weight.value} {userProfile.weight.unit}
                                </div>
                            </div>
                        )}

                        {userProfile && userProfile.startingWeight && userProfile.startingWeight.value && (
                            <div className="current-weight starting-weight">
                                <h3>Starting Weight</h3>
                                <div className="current-weight-value">
                                    {userProfile.startingWeight.value} {userProfile.startingWeight.unit}
                                </div>
                            </div>
                        )}

                        {goals.length === 0 ? (
                            <div className="no-goals-message">You don't have any goals yet.</div>
                        ) : (
                            <div className="goals-list">
                                {goals.map(goal => (
                                    <div
                                        key={goal._id}
                                        className={`goal-item ${selectedGoal && selectedGoal._id === goal._id ? 'active' : ''} ${!goal.isActive ? 'inactive' : ''}`}
                                        onClick={() => setSelectedGoal(goal)}
                                    >
                                        <div className="goal-type">
                                            {goal.goalType === 'lose_weight' ? 'Lose Weight' : 'Gain Weight'}
                                        </div>
                                        <div className="goal-target">
                                            {goal.targetWeight ? (
                                                <span>Target: {goal.targetWeight.value} {goal.targetWeight.unit}</span>
                                            ) : (
                                                <span>Body Fat: {goal.targetBodyFatPercentage}%</span>
                                            )}
                                        </div>
                                        <div className="goal-timeframe">
                                            {getTimeLeft(goal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="add-goal-btn"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancel' : 'Add New Goal'}
                        </button>

                        {showForm && (
                            <form onSubmit={handleSubmitGoal} className="goal-form">
                                <div className="form-group">
                                    <label>Goal Type</label>
                                    <select
                                        name="goalType"
                                        value={newGoal.goalType}
                                        onChange={handleGoalChange}
                                        required
                                    >
                                        <option value="lose_weight">Lose Weight</option>
                                        <option value="gain_weight">Gain Weight</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Target Weight</label>
                                    <div className="input-with-unit">
                                        <input
                                            type="number"
                                            name="targetWeightValue"
                                            value={newGoal.targetWeight.value}
                                            onChange={handleGoalChange}
                                            min="0"
                                            step="0.1"
                                            required
                                        />
                                        <select
                                            name="targetWeightUnit"
                                            value={newGoal.targetWeight.unit}
                                            onChange={handleGoalChange}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lb">lb</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Target Body Fat Percentage (Optional)</label>
                                    <input
                                        type="number"
                                        name="targetBodyFatPercentage"
                                        value={newGoal.targetBodyFatPercentage}
                                        onChange={handleGoalChange}
                                        min="1"
                                        max="40"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Timeframe (in months)</label>
                                    <input
                                        type="number"
                                        name="timeframe"
                                        value={newGoal.timeframe}
                                        onChange={handleGoalChange}
                                        min="1"
                                        max="36"
                                        required
                                    />
                                </div>

                                <button type="submit" className="save-button" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Goal'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="goals-detail">
                        {selectedGoal ? (
                            <div className="goal-details">
                                <div className="goal-header">
                                    <h2>
                                        {selectedGoal.goalType === 'lose_weight' ? 'Weight Loss Goal' : 'Weight Gain Goal'}
                                    </h2>
                                    <div className="goal-dates">
                                        <span>Started: {formatDate(selectedGoal.startDate)}</span>
                                        <span>Target: {formatDate(selectedGoal.targetDate)}</span>
                                    </div>
                                </div>

                                <div className="goal-summary">
                                    <div className="summary-item">
                                        <div className="summary-label">Starting Weight</div>
                                        <div className="summary-value">
                                            {selectedGoal.startWeight.value} {selectedGoal.startWeight.unit}
                                        </div>
                                    </div>

                                    <div className="summary-item">
                                        <div className="summary-label">Target Weight</div>
                                        <div className="summary-value">
                                            {selectedGoal.targetWeight.value} {selectedGoal.targetWeight.unit}
                                        </div>
                                    </div>

                                    {userProfile && userProfile.weight && userProfile.weight.value && (
                                        <div className="summary-item">
                                            <div className="summary-label">Current Weight</div>
                                            <div className="summary-value">
                                                {userProfile.weight.value} {userProfile.weight.unit}
                                            </div>
                                        </div>
                                    )}

                                    {selectedGoal.targetBodyFatPercentage && (
                                        <div className="summary-item">
                                            <div className="summary-label">Target Body Fat</div>
                                            <div className="summary-value">
                                                {selectedGoal.targetBodyFatPercentage}%
                                            </div>
                                        </div>
                                    )}

                                    <div className="summary-item">
                                        <div className="summary-label">Time Left</div>
                                        <div className="summary-value">
                                            {getTimeLeft(selectedGoal)}
                                        </div>
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <h3>Progress</h3>

                                    <div className="progress-circular-container">
                                        <div className="circular-progress">
                                            <CircularProgressbar
                                                value={calculateProgressPercentage(selectedGoal)}
                                                text={`${calculateProgressPercentage(selectedGoal).toFixed(1)}%`}
                                                styles={buildStyles({
                                                    rotation: 0,
                                                    strokeLinecap: 'round',
                                                    textSize: '16px',
                                                    pathTransitionDuration: 0.5,
                                                    pathColor: `var(--Primary-Color-Red)`,
                                                    textColor: 'var(--Text-Color-White)',
                                                    trailColor: '#444',
                                                    backgroundColor: 'var(--Background-Color-Light)',
                                                })}
                                            />
                                        </div>
                                        <div className="progress-info">
                                            {selectedGoal.goalType === 'lose_weight' && selectedGoal.progressEntries && selectedGoal.progressEntries.length > 0 ? (
                                                <div>
                                                    <div className="progress-info-item">
                                                        <span>Weight lost:</span>
                                                        <span>
                                                            {(parseFloat(selectedGoal.startWeight.value || 0) - parseFloat(selectedGoal.progressEntries[selectedGoal.progressEntries.length - 1].weight.value || 0)).toFixed(1)}
                                                            {selectedGoal.startWeight.unit}
                                                        </span>
                                                    </div>
                                                    <div className="progress-info-item">
                                                        <span>Remaining:</span>
                                                        <span>
                                                            {(parseFloat(selectedGoal.progressEntries[selectedGoal.progressEntries.length - 1].weight.value || 0) - parseFloat(selectedGoal.targetWeight.value || 0)).toFixed(1)}
                                                            {selectedGoal.targetWeight.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : selectedGoal.goalType === 'gain_weight' && selectedGoal.progressEntries && selectedGoal.progressEntries.length > 0 ? (
                                                <div>
                                                    <div className="progress-info-item">
                                                        <span>Weight gained:</span>
                                                        <span>
                                                            {(parseFloat(selectedGoal.progressEntries[selectedGoal.progressEntries.length - 1].weight.value || 0) - parseFloat(selectedGoal.startWeight.value || 0)).toFixed(1)}
                                                            {selectedGoal.startWeight.unit}
                                                        </span>
                                                    </div>
                                                    <div className="progress-info-item">
                                                        <span>Remaining:</span>
                                                        <span>
                                                            {(parseFloat(selectedGoal.targetWeight.value || 0) - parseFloat(selectedGoal.progressEntries[selectedGoal.progressEntries.length - 1].weight.value || 0)).toFixed(1)}
                                                            {selectedGoal.targetWeight.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="calendar-section">
                                        <h4>Progress Tracking Calendar</h4>
                                        <div className="calendar-heatmap-container">
                                            <CalendarHeatmap
                                                startDate={calendarView.startDate}
                                                endDate={calendarView.endDate}
                                                values={getCalendarData(selectedGoal)}
                                                classForValue={(value) => {
                                                    if (!value) {
                                                        return 'color-empty';
                                                    }
                                                    return `color-scale-${Math.min(4, Math.ceil(value.count))}`;
                                                }}
                                                tooltipDataAttrs={(value) => {
                                                    if (!value || !value.date) {
                                                        return null;
                                                    }
                                                    return {
                                                        'data-tip': `Date: ${value.date}, Weight: ${value.weight}${selectedGoal.startWeight.unit}${value.bodyFat ? `, Body Fat: ${value.bodyFat}%` : ''}`,
                                                    };
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="progress-entries">
                                        <h4>Progress History</h4>

                                        {selectedGoal.progressEntries && selectedGoal.progressEntries.length > 0 ? (
                                            <div className="entries-table">
                                                <div className="table-header">
                                                    <div className="header-cell">Date</div>
                                                    <div className="header-cell">Weight</div>
                                                    <div className="header-cell">Body Fat</div>
                                                </div>

                                                {[...selectedGoal.progressEntries].reverse().map((entry, index) => (
                                                    <div key={index} className="table-row">
                                                        <div className="table-cell">{formatDate(entry.date)}</div>
                                                        <div className="table-cell">
                                                            {entry.weight.value} {entry.weight.unit}
                                                        </div>
                                                        <div className="table-cell">
                                                            {entry.bodyFatPercentage ? `${entry.bodyFatPercentage}%` : '-'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-entries">No progress entries yet.</div>
                                        )}

                                        <button
                                            className="add-progress-btn"
                                            onClick={() => setShowProgressForm(!showProgressForm)}
                                        >
                                            {showProgressForm ? 'Cancel' : 'Add Progress Entry'}
                                        </button>

                                        {showProgressForm && (
                                            <form onSubmit={handleSubmitProgress} className="progress-form">
                                                <div className="form-group">
                                                    <label>Date</label>
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        value={progressEntry.date}
                                                        onChange={handleProgressChange}
                                                        max={format(new Date(), 'yyyy-MM-dd')}
                                                        required
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Current Weight</label>
                                                    <div className="input-with-unit">
                                                        <input
                                                            type="number"
                                                            name="weightValue"
                                                            value={progressEntry.weight.value}
                                                            onChange={handleProgressChange}
                                                            min="0"
                                                            step="0.1"
                                                            required
                                                        />
                                                        <select
                                                            name="weightUnit"
                                                            value={progressEntry.weight.unit}
                                                            onChange={handleProgressChange}
                                                        >
                                                            <option value="kg">kg</option>
                                                            <option value="lb">lb</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Current Body Fat Percentage (Optional)</label>
                                                    <input
                                                        type="number"
                                                        name="bodyFatPercentage"
                                                        value={progressEntry.bodyFatPercentage}
                                                        onChange={handleProgressChange}
                                                        min="1"
                                                        max="40"
                                                        step="0.1"
                                                    />
                                                </div>

                                                <button type="submit" className="save-button" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Saving...' : 'Save Progress'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                <div className="badges-section">
                                    <h3>Achievement Badges</h3>
                                    <div className="badges-container">
                                        <div className="badge active">
                                            <div className="badge-icon">🏆</div>
                                            <div className="badge-title">Getting Started</div>
                                            <div className="badge-description">You've started your fitness journey!</div>
                                        </div>
                                        
                                        <div className={`badge ${calculateProgressPercentage(selectedGoal) >= 50 ? 'active' : 'inactive'}`}>
                                            <div className="badge-icon">🔥</div>
                                            <div className="badge-title">Halfway There</div>
                                            <div className="badge-description">You've reached 50% of your goal!</div>
                                        </div>
                                        
                                        <div className={`badge ${calculateProgressPercentage(selectedGoal) >= 100 ? 'active' : 'inactive'}`}>
                                            <div className="badge-icon">🎯</div>
                                            <div className="badge-title">Goal Achieved</div>
                                            <div className="badge-description">Congratulations! You've reached your goal!</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-goal-selected">
                                {goals.length > 0 ? (
                                    <p>Select a goal from the list to view details.</p>
                                ) : (
                                    <p>Create a goal to start tracking your progress!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Goals; 