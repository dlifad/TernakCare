import React from 'react';
import { Link } from '@inertiajs/react';

const ActivityHistory = ({ activity }) => {
  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Helper function to generate activity status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-white',
      completed: 'bg-success text-white',
      ongoing: 'bg-info text-white',
      cancelled: 'bg-danger text-white',
      approved: 'bg-success text-white',
      rejected: 'bg-danger text-white'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status.toLowerCase()] || 'bg-neutral-light text-neutral-dark'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Helper function to get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'consultation':
        return (
          <div className="w-10 h-10 rounded-full bg-info bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'purchase':
        return (
          <div className="w-10 h-10 rounded-full bg-success bg-opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-neutral-light hover:bg-neutral-lightest">
      {getActivityIcon(activity.type)}
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-neutral-darkest">{activity.title}</h4>
          {getStatusBadge(activity.status)}
        </div>
        
        <p className="text-sm text-neutral-dark mb-2">{activity.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral">
            {formatDate(activity.created_at)}
          </span>
          
          {activity.link && (
            <Link 
              href={activity.link} 
              className="text-xs text-primary-dark hover:text-primary font-medium flex items-center"
            >
              Lihat Detail
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;