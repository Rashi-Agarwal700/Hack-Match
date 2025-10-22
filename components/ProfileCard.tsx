
import React from 'react';
import type { User } from '../types';

interface TeamMemberCardProps {
  member: User;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <div className="bg-background dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark flex items-center space-x-4">
      <img src={member.avatarUrl} alt={member.name} className="w-16 h-16 rounded-full border-2 border-secondary dark:border-secondary-dark" />
      <div className="flex-1">
        <h4 className="font-bold text-text-primary dark:text-text-primary-dark">{member.name}</h4>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{member.college}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {member.skills.map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark text-xs font-medium rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
