import React from 'react';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  trend = null,
  trendLabel = '' 
}) => {
  // Color classes based on theme
  const colorClasses = {
    primary: 'card-primary',
    secondary: 'card-secondary',
    success: 'card-success',
    warning: 'card-warning',
    danger: 'card-danger'
  };
  
  // Trend arrow icons
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };
  
  // Trend color classes
  const trendColors = {
    up: 'trend-up',
    down: 'trend-down',
    neutral: 'trend-neutral'
  };
  
  return (
    <div className={`metric-card ${colorClasses[color]}`}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {icon && <div className="card-icon">{icon}</div>}
        </div>
        
        <div className="card-value">{value}</div>
        
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
        
        {trend && (
          <div className={`card-trend ${trendColors[trend]}`}>
            <span className="trend-icon">{trendIcons[trend]}</span>
            <span className="trend-label">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;