import React, { useState, useCallback, useEffect } from 'react';
import type { Hackathon, Team, TeamAnalysis, User } from '../types';
import { analyzeTeamBalance } from '../services/geminiService';
import { CloseIcon, SparklesIcon, InfoIcon, LightbulbIcon } from './icons';
import TeamMemberCard from './ProfileCard';
import { AnimatePresence, motion } from 'framer-motion';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathon: Hackathon | null;
  team: Team | null;
  currentUser: User;
  onCreateTeam: (teamName: string) => void;
  onJoinTeam: (teamCode: string) => void;
}

type ModalView = 'manage' | 'create' | 'join' | 'no_team';

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, hackathon, team, currentUser, onCreateTeam, onJoinTeam }) => {
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ModalView>('no_team');
  
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView(team ? 'manage' : 'no_team');
    }
  }, [isOpen, team]);

  const handleAnalyze = useCallback(async () => {
    if (!team || !hackathon) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeTeamBalance(team, hackathon);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [team, hackathon]);
  
  const handleClose = () => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setTeamName('');
    setTeamCode('');
    onClose();
  }
  
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreateTeam(teamName.trim());
      setTeamName('');
    }
  };

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      onJoinTeam(teamCode.trim());
      // Here you would typically validate the code. For this prototype, we'll assume it works.
      setTeamCode('');
    }
  };

  if (!isOpen || !hackathon) return null;
  
  const scoreColor = analysis && analysis.score > 75 ? 'text-green-500' : analysis && analysis.score > 50 ? 'text-yellow-500' : 'text-red-500';

  const modalContent = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <motion.div 
        className="bg-surface dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <header className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Team Management</h2>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">For: {hackathon.title}</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-background-dark">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          <AnimatePresence mode="wait">
            {view === 'no_team' && (
              <motion.div key="no_team" variants={modalContent} initial="hidden" animate="visible" exit="exit">
                <h3 className="text-lg font-semibold text-center mb-4">You're not on a team for this hackathon yet.</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setView('create')} className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-all">Create a New Team</button>
                  <button onClick={() => setView('join')} className="px-6 py-3 bg-background dark:bg-background-dark border border-border-light dark:border-border-dark text-text-primary dark:text-text-primary-dark font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Join with a Code</button>
                </div>
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div key="create" variants={modalContent} initial="hidden" animate="visible" exit="exit">
                <h3 className="text-lg font-semibold mb-3">Create Your Team</h3>
                <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team's name"
                    className="w-full px-3 py-2 bg-background dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setView('no_team')} className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Back</button>
                    <button type="submit" className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">Create Team</button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {view === 'join' && (
               <motion.div key="join" variants={modalContent} initial="hidden" animate="visible" exit="exit">
                <h3 className="text-lg font-semibold mb-3">Join a Team</h3>
                <form onSubmit={handleJoinTeam} className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="Enter the 6-character team code"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-background dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setView('no_team')} className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Back</button>
                    <button type="submit" className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">Join Team</button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'manage' && team && (
              <motion.div key="manage" variants={modalContent} initial="hidden" animate="visible" exit="exit">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Your Team: {team.name} <span className="text-sm font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">({team.teamCode})</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map(member => <TeamMemberCard key={member.id} member={member} />)}
                  </div>
                </section>

                <section className="mt-6 text-center">
                  <button onClick={handleAnalyze} disabled={isLoading} className="flex items-center justify-center mx-auto space-x-2 px-6 py-3 bg-accent dark:bg-accent-dark text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                    <SparklesIcon className="w-5 h-5" />
                    <span>{isLoading ? 'Analyzing...' : 'Analyze Team Balance'}</span>
                  </button>
                </section>

                {isLoading && (
                  <div className="text-center p-8"><div className="inline-block animate-pulse-fast"><SparklesIcon className="w-10 h-10 text-accent dark:text-accent-dark" /></div><p className="mt-4 text-text-secondary dark:text-text-secondary-dark">AI is calculating your team's synergy...</p></div>
                )}

                {error && <div className="mt-4 bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-lg text-center"><p><strong>Error:</strong> {error}</p></div>}
                
                {analysis && (
                  <motion.div className="mt-6 bg-background dark:bg-background-dark p-6 rounded-lg border border-border-light dark:border-border-dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-lg font-semibold mb-4 text-center">AI-Powered Team Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-surface dark:bg-surface-dark p-4 rounded-lg"><p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Match Score</p><p className={`text-4xl font-bold ${scoreColor}`}>{analysis.score}%</p></div>
                      <div className="bg-surface dark:bg-surface-dark p-4 rounded-lg col-span-2"><p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Summary</p><p className="text-md font-semibold mt-2">{analysis.summary}</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-surface dark:bg-surface-dark p-4 rounded-lg"><h4 className="font-semibold flex items-center"><InfoIcon className="w-5 h-5 mr-2 text-yellow-500"/>Missing Skills</h4>{analysis.missingSkills.length > 0 ? (<div className="flex flex-wrap gap-2 mt-2">{analysis.missingSkills.map(skill => <span key={skill} className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs font-medium rounded-full">{skill}</span>)}</div>) : <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">No critical skills missing!</p>}</div>
                      <div className="bg-surface dark:bg-surface-dark p-4 rounded-lg"><h4 className="font-semibold flex items-center"><LightbulbIcon className="w-5 h-5 mr-2 text-green-500"/>Suggestions</h4><p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">{analysis.suggestions}</p></div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default TeamModal;