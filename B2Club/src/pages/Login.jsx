import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCustomer } from '../services/api';
import { UserSquare2, Lock, Phone } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ number: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await loginCustomer(formData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <UserSquare2 size={32} color="white" />
                    </div>
                    <h1>PRObuyers</h1>
                    <p>Login to your customer portal</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                            <Phone size={18} className="input-icon" />
                            <input
                                type="text"
                                name="number"
                                placeholder="Enter your phone number"
                                value={formData.number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>

            <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-main);
          padding: 20px;
        }
        .login-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--border-color);
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-header .logo-icon {
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 8px;
        }
        .login-header p {
          color: var(--text-muted);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          outline: none;
          transition: 0.2s;
          font-size: 15px;
        }
        .input-with-icon input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-light);
        }
        .login-btn {
          background: var(--primary);
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          margin-top: 10px;
          transition: 0.2s;
        }
        .login-btn:hover {
          background: #4f46e5;
        }
        .login-btn:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default Login;
