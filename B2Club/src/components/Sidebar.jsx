import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, PhoneCall, Bookmark, Wallet, User } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Inbox size={20} />, label: 'Leads Inbox', path: '/leads-inbox' },
        { icon: <PhoneCall size={20} />, label: 'Contacted Leads', path: '/contacted' },
        { icon: <Bookmark size={20} />, label: 'Saved Leads', path: '/saved' },
        // { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
        { icon: <User size={20} />, label: 'Profile', path: '/profile' },
    ];

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-menu">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </aside>

            <nav className="bottom-nav">
                {menuItems.slice(0, 4).map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
};

export default Sidebar;
