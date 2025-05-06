import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        height: { value: '', unit: 'cm' },
        weight: { value: '', unit: 'kg' },
        startingWeight: { value: '', unit: 'kg' },
        dateOfBirth: '',
        gender: '',
        dietaryPreferences: []
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetchUserProfile();
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3030/api/user/profile', {
                headers: { Authorization: token }
            });

            setProfile(response.data);
            if (response.data.profilePicture) {
                const picturePath = response.data.profilePicture.startsWith('/') 
                    ? response.data.profilePicture 
                    : `/${response.data.profilePicture}`;
                setPreviewUrl(`http://localhost:3030${picturePath}`);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'heightValue') {
            setProfile({
                ...profile,
                height: { ...profile.height, value: parseFloat(value) || '' }
            });
        } else if (name === 'heightUnit') {
            setProfile({
                ...profile,
                height: { ...profile.height, unit: value }
            });
        } else if (name === 'weightValue') {
            setProfile({
                ...profile,
                weight: { ...profile.weight, value: parseFloat(value) || '' }
            });
        } else if (name === 'weightUnit') {
            setProfile({
                ...profile,
                weight: { ...profile.weight, unit: value }
            });
        } else if (name === 'startingWeightValue') {
            setProfile({
                ...profile,
                startingWeight: { ...profile.startingWeight, value: parseFloat(value) || '' }
            });
        } else if (name === 'startingWeightUnit') {
            setProfile({
                ...profile,
                startingWeight: { ...profile.startingWeight, unit: value }
            });
        } else {
            setProfile({
                ...profile,
                [name]: value
            });
        }
    };

    const handleDietaryPreferenceChange = (preference) => {
        const updatedPreferences = [...profile.dietaryPreferences];

        if (updatedPreferences.includes(preference)) {
            const index = updatedPreferences.indexOf(preference);
            updatedPreferences.splice(index, 1);
        } else {
            updatedPreferences.push(preference);
        }

        setProfile({
            ...profile,
            dietaryPreferences: updatedPreferences
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);

            // Create preview URL
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Update user profile
            await axios.put('http://localhost:3030/api/user/profile', {
                name: profile.name,
                height: profile.height,
                weight: profile.weight,
                startingWeight: profile.startingWeight,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                dietaryPreferences: profile.dietaryPreferences
            }, {
                headers: { Authorization: token }
            });

            // If there's a new profile picture, upload it
            if (profilePicture) {
                const formData = new FormData();
                formData.append('profilePicture', profilePicture);

                const pictureResponse = await axios.post('http://localhost:3030/api/user/profile/picture', formData, {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // Clear the local profilePicture state after successful upload
                setProfilePicture(null);

                // Force reload user data elsewhere in the app by updating localStorage
                const userDataStr = localStorage.getItem('userData');
                if (userDataStr) {
                    try {
                        const userData = JSON.parse(userDataStr);
                        userData.profilePicture = pictureResponse.data.profilePicture;
                        localStorage.setItem('userData', JSON.stringify(userData));
                    } catch (e) {
                        console.error('Error updating localStorage userData', e);
                    }
                } else {
                    // Store initial userData
                    const userData = { 
                        profilePicture: pictureResponse.data.profilePicture,
                        ...profile 
                    };
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
            }

            // Fetch the updated profile to get the latest profile picture URL
            await fetchUserProfile();

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <Sidebar />
                <Navbar />
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <Sidebar />
            <Navbar />
            <div className="profile-content">
                <h1>My Profile</h1>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-picture-section">
                        <div className="profile-picture">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <div className="profile-picture-upload">
                            <label htmlFor="profile-picture-input" className="upload-btn">
                                Change Profile Picture
                            </label>
                            <input
                                id="profile-picture-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            disabled
                            className="disabled-input"
                        />
                        <small>Email cannot be changed</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Height</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    name="heightValue"
                                    value={profile.height.value}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                                <select
                                    name="heightUnit"
                                    value={profile.height.unit}
                                    onChange={handleChange}
                                >
                                    <option value="cm">cm</option>
                                    <option value="in">in</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Current Weight</label>
                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    name="weightValue"
                                    value={profile.weight.value}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                                <select
                                    name="weightUnit"
                                    value={profile.weight.unit}
                                    onChange={handleChange}
                                >
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Starting Weight (for goals tracking)</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                name="startingWeightValue"
                                value={profile.startingWeight.value}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="Your initial weight before starting fitness journey"
                            />
                            <select
                                name="startingWeightUnit"
                                value={profile.startingWeight.unit}
                                onChange={handleChange}
                            >
                                <option value="kg">kg</option>
                                <option value="lb">lb</option>
                            </select>
                        </div>
                        <small>This will be used as reference for your progress tracking</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={profile.gender || ''} onChange={handleChange}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dietary Preferences</label>
                        <div className="checkbox-group">
                            {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo', 'none'].map((preference) => (
                                <div key={preference} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`preference-${preference}`}
                                        checked={profile.dietaryPreferences?.includes(preference) || false}
                                        onChange={() => handleDietaryPreferenceChange(preference)}
                                    />
                                    <label htmlFor={`preference-${preference}`}>
                                        {preference.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="save-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile; 