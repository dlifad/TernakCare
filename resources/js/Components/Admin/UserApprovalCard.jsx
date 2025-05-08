import React from 'react';
import { UserCircle, Calendar, Mail, Tag } from 'lucide-react';

export default function UserApprovalCard({ user }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'farmer':
        return 'bg-primary-light text-primary-dark';
      case 'doctor':
        return 'bg-secondary-light text-secondary-dark';
      case 'shop':
        return 'bg-accent-light text-accent-dark';
      default:
        return 'bg-neutral-light text-neutral-dark';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white shadow-soft rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex-shrink-0">
            <UserCircle size={48} className="text-neutral" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-neutral-darkest">{user.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center text-sm text-neutral-dark">
                <Mail size={16} className="mr-1" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-neutral-dark">
                <Calendar size={16} className="mr-1" />
                {formatDate(user.createdAt)}
              </div>
              <div className="flex items-center">
                <Tag size={16} className="mr-1" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 transition-colors">
            Approve
          </button>
          <button className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}