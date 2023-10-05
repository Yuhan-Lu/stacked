import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const response = await axios.post('/api/signup', {
                username: username,
                password: password,
            });

            // Signup successful
            if (response.status === 201) {
                alert('Your account has been successfully created!');
            }
        } catch (error) {
            if (error.response) {
                // Request was made and server responded with a status other than in the range of 2xx
                if (error.response.status === 400) {
                    if (error.response.data["error"] === "Username or Password missing") {
                        alert('Missing info!');
                    } else if (error.response.data["error"] === "Username already exists") {
                        alert('Username already exists!');
                    }
                }
            } else {
                // Other errors (like network issues)
                alert('Error during signup. Please try again.');
                console.error("Error during signup:", error);
            }
        }
    }



    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-15">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Sign up</h2>
                            <div className="mb-3">
                                <label className="form-label">Username:</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password:</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control"
                                />
                            </div>

                            <button className="btn btn-primary w-100" onClick={handleSignup} >Signup</button>
                            <div className="mt-3 text-center">
                                Already have an account? <Link to="/login">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
