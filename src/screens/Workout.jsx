import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import WorkoutLibrary from "../components/WorkoutLibrary";
import PersonalWorkouts from "../components/PersonalWorkouts";
import SavedWorkoutsTab from "../components/SavedWorkoutsTab";
import WorkoutDetails from "../components/WorkoutDetails";
import Modal from "react-modal";
import './Workout.css';

const Workout = () => {
    const [activeTab, setActiveTab] = useState("Library");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get('http://localhost:3000/exercise/workout', {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    }
                });

                // Handle both direct array response and object with data property
                const responseData = Array.isArray(response.data) 
                    ? response.data 
                    : response.data?.data || [];

                // Ensure each workout has an id field
                const formattedWorkouts = responseData.map(workout => ({
                    ...workout,
                    id: workout._id || workout.id || Math.random().toString(36).substring(2, 9)
                }));

                setWorkouts(formattedWorkouts);
                setError(null);
            } catch (error) {
                console.error('Error fetching workouts:', error);
                setError(error.message);
                
                // Fallback to sample data only if there are no workouts
                if (workouts.length === 0) {
                    setWorkouts([
                        {
                            id: 'sample-1',
                            title: 'Full Body Blast',
                            category: "Strength",
                            duration: "45 minutes",
                            difficulty: "Intermediate",
                            rating: 4.5,
                            creator: "FitnessPro",
                            description: "A comprehensive full body workout for intermediate fitness enthusiasts."
                        },
                        {
                            id: 'sample-2',
                            title: 'HIIT Cardio',
                            category: "Cardio",
                            duration: "30 minutes",
                            difficulty: "Advanced",
                            rating: 4.8,
                            creator: "CardioKing",
                            description: "High-intensity interval training to maximize calorie burn and improve cardiovascular fitness."
                        },
                        {
                            id: 'sample-3',
                            title: 'Yoga Flow',
                            category: "Yoga",
                            duration: "60 minutes",
                            difficulty: "Beginner",
                            rating: 4.2,
                            creator: "ZenMaster",
                            description: "A calming yoga flow to improve flexibility, balance and mental clarity."
                        }
                    ]);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchWorkouts();
    }, [workouts.length]);

    const handleTabChange = (tab) => setActiveTab(tab);

    const openModal = (workout) => {
        setSelectedWorkout(workout);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setSelectedWorkout(null);
        setModalIsOpen(false);
    };

    const renderTabContent = () => {
        if (loading) {
            return <div className="loading">Loading workouts...</div>;
        }

        if (error) {
            return (
                <div className="error-message">
                    <p>Error loading workouts: {error}</p>
                    <p>Showing sample data instead</p>
                </div>
            );
        }

        switch (activeTab) {
            case "Library":
                return <WorkoutLibrary workouts={workouts} clicked={openModal} />;
            case "Personal":
                return <PersonalWorkouts clicked={openModal} />;
            case "Saved":
                return <SavedWorkoutsTab clicked={openModal} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="Workout">
                <Navbar />
                <div className="WorkoutHero">
                    <div className="WorkoutNav">
                        {["Library", "Personal", "Saved"].map((tab) => (
                            <div
                                key={tab}
                                className={`WorkoutNavItem ${activeTab === tab ? "Active" : "Inactive"}`}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab === "Library" && "Workout Library"}
                                {tab === "Personal" && "Personal Workouts"}
                                {tab === "Saved" && "Saved Workouts"}
                            </div>
                        ))}
                    </div>

                    {renderTabContent()}

                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Workout Details"
                        ariaHideApp={false}
                    >
                        {selectedWorkout && <WorkoutDetails workout={selectedWorkout} />}
                        <button onClick={closeModal}>Close</button>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default Workout;




// import { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import WorkoutLibrary from "../components/WorkoutLibrary";
// import PersonalWorkouts from "../components/PersonalWorkouts";
// import SavedWorkoutsTab from "../components/SavedWorkoutsTab";
// import WorkoutDetails from "../components/WorkoutDetails";
// import Modal from "react-modal";
// import './Workout.css';

// const Workout = () => {
//     const [activeTab, setActiveTab] = useState("Library");
//     const [modalIsOpen, setModalIsOpen] = useState(false);
//     const [selectedWorkout, setSelectedWorkout] = useState(null);
//     const [workouts, setWorkouts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Fetch workouts from API when component mounts
//         const fetchWorkouts = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 console.log('Getting workouts with token', token);
//                 const response = await axios.get('http://localhost:3000/exercise/workout', {
//                     headers: { 
//                         'Authorization': `Bearer ${localStorage.getItem('token')}` 
//                     }
//                 });
//                 setWorkouts(response.data.map(workout => ({
//                     ...workout,
//                     id: workout._id || workout.id // Use _id if id doesn't exist
//                 })));
//                 ////setWorkouts(response.data);
//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching workouts:', error);
//                 // Fallback to sample data if API fails
//                 setWorkouts([
//                     {
//                         id: 1280,
//                         title: 'Full Body Blast',
//                         category: "Strength",
//                         duration: "45 minutes",
//                         difficulty: "Intermediate",
//                         rating: 4.5,
//                         creator: "FitnessPro",
//                         description: "A comprehensive full body workout for intermediate fitness enthusiasts."
//                     },
//                     {
//                         id: 1281,
//                         title: 'HIIT Cardio',
//                         category: "Cardio",
//                         duration: "30 minutes",
//                         difficulty: "Advanced",
//                         rating: 4.8,
//                         creator: "CardioKing",
//                         description: "High-intensity interval training to maximize calorie burn and improve cardiovascular fitness."
//                     },
//                     {
//                         id: 1282,
//                         title: 'Yoga Flow',
//                         category: "Yoga",
//                         duration: "60 minutes",
//                         difficulty: "Beginner",
//                         rating: 4.2,
//                         creator: "ZenMaster",
//                         description: "A calming yoga flow to improve flexibility, balance and mental clarity."
//                     }
//                 ]);
//                 setLoading(false);
//             }
//         };
        
//         fetchWorkouts();
//     }, []);

//     const handleTabChange = (tab) => setActiveTab(tab);

//     const openModal = (workout) => {
//         setSelectedWorkout(workout);
//         setModalIsOpen(true);
//     };

//     const closeModal = () => {
//         setSelectedWorkout(null);
//         setModalIsOpen(false);
//     };

//     const renderTabContent = () => {
//         if (loading) {
//             return <div className="loading">Loading workouts...</div>;
//         }

//         switch (activeTab) {
//             case "Library":
//                 return <WorkoutLibrary workouts={workouts} clicked={openModal} />;
//             case "Personal":
//                 return <PersonalWorkouts clicked={openModal} />;
//             case "Saved":
//                 return <SavedWorkoutsTab clicked={openModal} />;
//             default:
//                 return null;
//         }
//     };

//     return (
//         <>
//             <div className="Workout">
//                 <Navbar />
//                 <div className="WorkoutHero">
//                     <div className="WorkoutNav">
//                         {["Library", "Personal", "Saved"].map((tab) => (
//                             <div
//                                 key={tab}
//                                 className={`WorkoutNavItem ${activeTab === tab ? "Active" : "Inactive"}`}
//                                 onClick={() => handleTabChange(tab)}
//                             >
//                                 {tab === "Library" && "Workout Library"}
//                                 {tab === "Personal" && "Personal Workouts"}
//                                 {tab === "Saved" && "Saved Workouts"}
//                             </div>
//                         ))}
//                     </div>

//                     {renderTabContent()}

//                     <Modal
//                         isOpen={modalIsOpen}
//                         onRequestClose={closeModal}
//                         contentLabel="Workout Details"
//                     >
//                         {selectedWorkout && <WorkoutDetails workout={selectedWorkout} />}
//                         <button onClick={closeModal}>Close</button>
//                     </Modal>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Workout;