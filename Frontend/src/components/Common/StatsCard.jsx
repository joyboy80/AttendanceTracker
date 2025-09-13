import React from 'react';

const StatsCard = ({ title, value, icon, color = 'primary', trend }) => {
  return (
    <div className={`card stats-card ${color} h-100`}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <h2 className="stats-number mb-0">{value}</h2>
            {trend && (
              <small className={`text-${trend.isPositive ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} me-1`}></i>
                {Math.abs(trend.value)}%
              </small>
            )}
          </div>
          <div className={`text-${color}`} style={{ fontSize: '2.5rem', opacity: 0.7 }}>
            <i className={icon}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;