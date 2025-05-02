import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import '../styles/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // Navigation links - grouped by category
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        {
            category: 'Workouts',
            items: [
                { path: '/workout', label: 'My Workouts', icon: 'fitness_center' },
                { path: '/exercise-library', label: 'Exercise Library', icon: 'list' },
                { path: '/workout-creator', label: 'Create Workout', icon: 'add', disabled: true },
                { path: '/saved-workouts', label: 'Saved Workouts', icon: 'favorite', disabled: true },
            ]
        },
        {
            category: 'Nutrition',
            items: [
                { path: '/food-database', label: 'Food Database', icon: 'restaurant' },
                { path: '/calorie-tracking', label: 'Calorie Tracking', icon: 'monitoring', disabled: true },
                { path: '/meal-plans', label: 'Meal Plans', icon: 'menu_book', disabled: true },
            ]
        },
        {
            category: 'Goals & Progress',
            items: [
                { path: '/goals', label: 'Fitness Goals', icon: 'flag' },
                { path: '/social-workout', label: 'Social Workouts', icon: 'groups', disabled: true },
                { path: '/community', label: 'Community', icon: 'forum', disabled: true },
            ]
        },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            
            <button className={`sidebar-toggle ${isOpen ? 'open-toggle' : ''}`} onClick={toggleSidebar}>
                <i className="material-icons">{isOpen ? 'close' : 'dehaze'}</i>
            </button>
            
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="logo-container">
                    <h2>Warzish</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, index) => (
                        item.category ? (
                            <div key={index} className="nav-category">
                                <h3 className="category-title">{item.category}</h3>
                                {item.items.map((subItem, subIndex) => (
                                    <Link
                                        key={subIndex}
                                        to={subItem.disabled ? '#' : subItem.path}
                                        className={`nav-link ${currentPath === subItem.path ? 'active' : ''} ${subItem.disabled ? 'disabled' : ''}`}
                                        onClick={e => {
                                            if (subItem.disabled) e.preventDefault();
                                            else setIsOpen(false);
                                        }}
                                    >
                                        <i className="material-icons">{subItem.icon}</i>
                                        <span className="nav-label">{subItem.label}</span>
                                        {subItem.disabled && <span className="coming-soon">Coming soon</span>}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Link
                                key={index}
                                to={item.path}
                                className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="material-icons">{item.icon}</i>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        )
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar; 