import React from 'react';
import { ArrowRight } from 'lucide-react';

const ActionCard = ({ title, subtitle, icon, colorClass }) => {
    return (
        <div className="action-card">
            <div className="action-left">
                <div className={`action-icon-container ${colorClass}`}>
                    {icon}
                </div>
                <div className="action-info">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
            </div>
            <button className="action-btn">
                <ArrowRight size={20} color="#64748b" />
            </button>
        </div>
    );
};

export default ActionCard;
