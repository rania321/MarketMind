// src/components/KPICard.jsx

import React from 'react';

const KPICard = ({ title, value, className }) => {
  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
};

export default KPICard;
