import React from 'react';
import { MessageCircle, Video, Calendar, MapPin } from 'lucide-react';

export default function ConsultationCard({ consultation }) {
  const getConsultationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageCircle size={20} className="text-primary" />;
      case 'video':
        return <Video size={20} className="text-accent" />;
      case 'visit':
        return <Calendar size={20} className="text-warning" />;
      default:
        return <MessageCircle size={20} className="text-primary" />;
    }
  };

  const getConsultationTypeBg = (type) => {
    switch (type) {
      case 'chat':
        return 'bg-primary-light';
      case 'video':
        return 'bg-accent-light';
      case 'visit':
        return 'bg-warning bg-opacity-20';
      default:
        return 'bg-primary-light';
    }
  };

  const getConsultationTypeLabel = (type) => {
    switch (type) {
      case 'chat':
        return 'Chat Consultation';
      case 'video':
        return 'Video Consultation';
      case 'visit':
        return 'Farm Visit';
      default:
        return 'Consultation';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white shadow-soft rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start mb-4 md:mb-0">
            <div className={`flex-shrink-0 rounded-md p-2 ${getConsultationTypeBg(consultation.type)}`}>
              {getConsultationIcon(consultation.type)}
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-neutral-darkest">{consultation.farmerName}</h3>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary-light text-primary-dark">
                  {consultation.farmType}
                </span>
              </div>
              
              <div className="mt-2 text-sm text-neutral-dark">
                <p className="mb-1">{getConsultationTypeLabel(consultation.type)} - {formatDate(consultation.date)} at {consultation.time}</p>
                <p className="font-medium">Issue: {consultation.issue}</p>
                {consultation.location && (
                  <div className="flex items-center mt-2 text-xs text-neutral">
                    <MapPin size={12} className="mr-1" />
                    {consultation.location}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 transition-colors">
              Accept
            </button>
            <button className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}