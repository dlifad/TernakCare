import React, { useState } from 'react';
import { UserCircle, Calendar, Mail, Tag, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function UserApprovalCard({ user }) {
  const [status, setStatus] = useState(user.status || 'pending');
  const [isProcessing, setIsProcessing] = useState(false);

  if (status !== 'pending') return null; // Sembunyikan jika status bukan 'pending'

  const getBadgeColor = (type, value) => {
    const colors = {
      role: {
        doctor: 'bg-blue-100 text-blue-800',
        shop: 'bg-amber-100 text-amber-800',
        default: 'bg-gray-100 text-gray-800',
      },
      status: {
        verified: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
      },
    };

    return colors[type][value?.toLowerCase()] || colors[type].default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid date'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  const handleAction = async (type) => {
    try {
      setIsProcessing(true);
      const response = await axios.post(`/admin/users/${user.id}/${type}`);
      if (response.status === 200) {
        setStatus(type === 'approve' ? 'verified' : 'rejected');
        alert(`User ${user.name} berhasil di-${type === 'approve' ? 'setujui' : 'tolak'}!`);
      }
    } catch (error) {
      alert(`Terjadi kesalahan saat memproses: ${error.message}`);
      console.error(`Error during ${type}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <UserCircle size={48} className="text-gray-500" />
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail size={16} className="mr-1" />
                {user.email}
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {formatDate(user.created_at || user.createdAt || user.date)}
              </div>
              <div className="flex items-center">
                <Tag size={16} className="mr-1" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor('role', user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor('status', status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
          <Link
            href={`/admin/users/${user.id}`}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Info size={16} className="mr-1" />
            View Details
          </Link>

          <div className="flex space-x-2">
            {['approve', 'reject'].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  action === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Processing...' : action.charAt(0).toUpperCase() + action.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
