import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import image from '../assets/Plan-Checklist.svg'
import './Login.css'

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState(""); // Add state for error messages
    const navigate = useNavigate(); // Initialize navigate for redirection

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        
        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Login Successful");
                localStorage.setItem('token', data.token); // Store token in localStorage
                navigate('/dashboard'); // Redirect to dashboard after successful login
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Login failed");
                console.error('Login failed:', errorData.error);
            }
        } catch (error) {
            setError("Network error. Please try again.");
            console.error("Error:", error);
        }
    };

    return (
        <React.Fragment>
            <div className="login">
                <div className="loginForm">
                    <h1>Welcome Back 👋</h1>
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="loginWrapper">
                            <div className="inputWrapper">
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="primary" 
                                    placeholder="Email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <input 
                                    type="password" 
                                    name="password" 
                                    className="primary" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />

                                <div className="checkboxWrapper">
                                    <div className="checkbox">
                                        {/* Checkbox implementation can go here */}
                                    </div>
                                    <p className="alert">Forgot Password?</p>
                                </div>
                            </div>
                            <button type="submit" className="button secondary">Login</button>
                        </div>
                    </form>
                </div>
                <div className="imageContainer">
                    <img src={image} alt="Login illustration" />
                </div>
            </div>
        </React.Fragment>
    )
}

export default Login


// import React, { useState } from "react";
// import image from '../assets/Plan-Checklist.svg'
// import './Login.css'

// const Login = () => {
//     const [formData, setFormData] = useState({
//         email: "",
//         password: ""
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prevState => ({
//             ...prevState,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await fetch("http://localhost:3000/api/login", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(formData)
//             });
//             // const data = await response.json();
//             if (response.ok) {
//                 console.log("Login Succesful");
//                 const { token } = await response.json();
//                 localStorage.setItem('token', token); // Store token in localStorage
//                 // Redirect to dashboard or other protected page
//             } else {
//                 const { error } = await response.json();
//                 console.error('Login failed:', error);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             // Handle other errors (e.g., network error)
//         }
//     };

//     return (
//         <React.Fragment>
//             <div className="login">
//                 <div className="loginForm">
//                     <h1>Welcome Back 👋</h1>

//                     <form onSubmit={handleSubmit}>
//                         <div className="loginWrapper">
//                             <div className="inputWrapper">
//                                 <input type="email" name="email" className="primary" placeholder="Email" value={formData.email} onChange={handleChange} />
//                                 <input type="password" name="password" className="primary" placeholder="Password" value={formData.password} onChange={handleChange} />

//                                 <div className="checkboxWrapper">
//                                     <div className="checkbox">
//                                         {/* <span onClick={toggleCheck}>
//                                         <input type="checkbox" checked={isChecked= getInitialState} />
//                                         <span></span>
//                                     </span> */}
//                                         {/* <label>Remember Me
//                                         <input className="box" type="checkbox"></input>
//                                     </label> */}
//                                         {/* <div className="box"></div> */}
//                                         {/* <p>Remember Me</p> */}
//                                     </div>
//                                     <p className="alert">Forgot Password?</p>
//                                 </div>
//                             </div>
//                             <button type="submit" className="button secondary">Login</button>
//                         </div>
//                     </form>
//                 </div>
//                 <div className="imageContainer">
//                     <img src={image}></img>
//                 </div>
//             </div>
//         </React.Fragment>
//     )
// }

// export default Login