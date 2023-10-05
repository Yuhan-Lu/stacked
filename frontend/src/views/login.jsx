import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const response = await axios.post('/api/login', {
                username,
                password,
            });

            console.log(response)
            if (response.status === 200 && response.data.access_token) {
                console.log(response.status, response.data.access_token)
                sessionStorage.setItem('access_token', response.data.access_token);
                sessionStorage.setItem('user_name', username);
                navigate('/VideoPage');
            }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 404)) {
                alert('Invalid credentials!');
            } else {
                alert('Error during login. Please try again.');
            }
        };
    }
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-auto">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Login</h2>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary w-100" onClick={handleLogin}>
                                Login
                            </button>
                            <div className="mt-3 text-center">
                                Don't have an account? <Link to="/signup">Sign up here</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
