import React from 'react';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="stat-card" style={{ '--accent-color': color }}>
        <div className="stat-header">
            <span className="stat-title">{title}</span>
            {Icon && <Icon size={20} className="stat-icon" />}
        </div>
        <div className="stat-value">{value}</div>
        {subValue && <div className="stat-subvalue">{subValue}</div>}
    </div>
);

export default StatCard;
