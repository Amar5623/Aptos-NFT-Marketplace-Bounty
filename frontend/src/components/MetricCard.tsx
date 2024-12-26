import React from 'react';

interface MetricCardProps {
  title: string;
  icon: string;
  value: string | number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, icon, value }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-gray-700 font-medium">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-indigo-600">{value}</div>
  </div>
);
