import React from 'react';
import type { Hackathon } from '../types';
import { CalendarIcon } from './icons';
import { motion } from 'framer-motion';

interface HackathonCardProps {
  hackathon: Hackathon;
  onViewDetails: (hackathon: Hackathon) => void;
  onManageTeam: (hackathon: Hackathon) => void;
  hasTeam: boolean;
}

const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon, onViewDetails, onManageTeam, hasTeam }) => {
  const getStatusColor = () => {
    switch (hackathon.status) {
      case 'Upcoming': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300';
      case 'Ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Past': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <motion.div 
      className="bg-surface dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
      layout
    >
      <div className="relative">
        <img src={hackathon.image} alt={hackathon.title} className="w-full h-40 object-cover rounded-t-xl" />
        <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()} shadow`}>
                {hackathon.status}
            </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{hackathon.title}</h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">by {hackathon.organizer}</p>
          <p className="mt-2 px-3 py-1 text-sm bg-secondary/10 text-secondary dark:bg-secondary-dark/20 dark:text-secondary-dark rounded-full inline-block">
            Theme: {hackathon.theme}
          </p>

          <div className="mt-4 space-y-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Reg: {hackathon.registrationStart} – {hackathon.registrationEnd}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span className="font-semibold text-text-primary dark:text-text-primary-dark">Event: {hackathon.eventStart} – {hackathon.eventEnd}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onViewDetails(hackathon)}
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border-light dark:border-border-dark text-text-primary dark:text-text-primary-dark font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            View Details
          </button>
          <button
            onClick={() => onManageTeam(hackathon)}
            className="w-full px-4 py-2 bg-secondary dark:bg-secondary-dark text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-all"
          >
            {hasTeam ? 'Manage Team' : 'Create / Join Team'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonCard;