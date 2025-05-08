import React from 'react';
import { Users, Stethoscope, Store, Clock } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const statItems = [
    {
      name: 'Total Farmers',
      value: stats.totalFarmers,
      icon: <Users size={24} className="text-primary" />,
      bgColor: 'bg-primary-light',
    },
    {
      name: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <Stethoscope size={24} className="text-secondary" />,
      bgColor: 'bg-secondary-light',
    },
    {
      name: 'Total Shops',
      value: stats.totalShops,
      icon: <Store size={24} className="text-accent" />,
      bgColor: 'bg-accent-light',
    },
    {
      name: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: <Clock size={24} className="text-warning" />,
      bgColor: 'bg-warning bg-opacity-20',
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow-soft rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${item.bgColor}`}>
                {item.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral truncate">{item.name}</dt>
                  <dd>
                    <div className="text-lg font-semibold text-neutral-darkest">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}