import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Plus, ChevronDown, UserSquare2, LogOut, User } from 'lucide-react';

const Header = ({ user }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo-container">
                    <div className="logo-icon">
                        <UserSquare2 size={24} color="white" />
                    </div>
                    <span className="logo-text">PRObuyers</span>
                </div>
            </div>

            <div className="header-right">
                <div className="wallet-badge">
                    <Wallet size={18} className="wallet-icon" />
                    <span className="balance">₹{user?.credit || 0}</span>
                </div>

                <a
                    href="https://wa.me/919925750145?text=Hello,%20I%20want%20to%20recharge%20my%20B2Club%20wallet."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    <button className="recharge-btn">
                        <Plus size={18} />
                        <span>Recharge</span>
                    </button>
                </a>

                <div className="profile-section">
                    <div
                        className="profile-dropdown-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="avatar">{getInitials(user?.name)}</div>
                        <ChevronDown size={16} color="#64748b" className={isDropdownOpen ? 'rotate' : ''} />
                    </div>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            {/* <div className="dropdown-header">
                                <p className="user-name">{user?.name}</p>
                                <p className="user-number">{user?.number}</p>
                            </div> */}
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                                <button className="dropdown-item">
                                    <User size={18} />
                                    <span>My Profile</span>
                                </button>
                            </Link>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
