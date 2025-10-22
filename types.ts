export interface User {
  id: number;
  name: string;
  college: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  github?: string;
  linkedin?: string;
}

export interface Team {
  id: number;
  name: string;
  members: User[];
  teamCode: string;
  hackathonId: number; // Link team to a specific hackathon
}

export type HackathonStatus = 'Upcoming' | 'Ongoing' | 'Past';

export interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  theme: string;
  image: string;
  description: string;
  registrationStart: string;
  registrationEnd: string;
  eventStart: string;
  eventEnd: string;
  status: HackathonStatus;
  registerLink: string;
  requiredSkills: string[];
}

export interface Article {
  id: number;
  title: string;
  source: string;
  link: string;
  publishedDate: string;
}

export interface TeamAnalysis {
  score: number;
  summary: string;
  missingSkills: string[];
  suggestions: string;
}
