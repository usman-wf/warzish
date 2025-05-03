import React, { useState } from "react";
import image from '../assets/Workout-Plan-Icon.svg'
import './Login.css'

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                // User successfully registered
                console.log("User registered successfully");
            } else {
                // Failed to register user
                console.error("Failed to register user");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <React.Fragment>
            <div className="signup login">
                <div className="signupForm loginForm">
                    <h1>Create an Account</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="signupWrapper loginWrapper">
                            <div className="inputWrapper">
                                <input type="text" className="primary" name="name" placeholder="Name" value={formData.name} onChange={handleChange}></input>
                                <input type="text" className="primary" name="username" placeholder="Username" value={formData.username} onChange={handleChange}></input>
                                <input type="email" className="primary" name="email" placeholder="Email" value={formData.email} onChange={handleChange}></input>
                                <input type="password" className="primary" name="password" placeholder="Password" value={formData.password} onChange={handleChange}></input>


                                {/* <div className="checkboxWrapper">
                                <div className="checkbox">
                                    <span onClick={toggleCheck}>
                                        <input type="checkbox" checked={isChecked= getInitialState} />
                                        <span></span>
                                    </span>
                                    <label>Remember Me
                                        <input className="box" type="checkbox"></input>
                                    </label>
                                    <div className="box"></div>
                                    <p>Remember Me</p>
                                </div>
                                <p className="alert">Forgot Password?</p>
                            </div> */}
                            </div>
                            <button type="submit" className="button secondary">Register</button>
                        </div>
                    </form>
                </div>
                <div className="imageContainer">
                    <img src={image}></img>
                </div>
            </div>
        </React.Fragment>
    )
}

export default SignUp