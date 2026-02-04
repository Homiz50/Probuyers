import React from 'react';

const StatsCard = ({ title, count, subtitle, icon, colorClass }) => {
    return (
        <div className="stats-card">
            <div className="stats-content">
                <p className="stats-title">{title}</p>
                <h2 className="stats-count">{count}</h2>
                <p className="stats-subtitle">{subtitle}</p>
            </div>
            <div className={`stats-icon-container ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
