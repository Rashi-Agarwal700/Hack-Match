
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HackathonCard from './components/ProjectCard';
import TeamModal from './components/RecommendationSection';
import { MOCK_HACKATHONS, MOCK_USERS, MOCK_ARTICLES } from './constants';
import type { Hackathon, Team, User, HackathonStatus, Article } from './types';
import { SparklesIcon, ExternalLinkIcon, GoogleIcon, GitHubIcon, SunIcon, MoonIcon, CloseIcon, UsersIcon, ClipboardListIcon, LightbulbIcon } from './components/icons';

type Theme = 'light' | 'dark';
type View = 'landing' | 'signup' | 'dashboard';

// --- Helper Functions ---
const generateTeamCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- Child Components ---

const HackathonDetailModal: React.FC<{ hackathon: Hackathon | null; onClose: () => void; }> = ({ hackathon, onClose }) => {
  if (!hackathon) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <motion.div
        className="bg-surface dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <img src={hackathon.image} alt={hackathon.title} className="w-full h-56 object-cover rounded-t-2xl" />
        <header className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">{hackathon.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-background-dark"><CloseIcon className="w-6 h-6" /></button>
        </header>
        <main className="p-6 overflow-y-auto">
          <p className="text-text-secondary dark:text-text-secondary-dark">{hackathon.description}</p>
        </main>
        <footer className="p-4 border-t border-border-light dark:border-border-dark mt-auto">
           <a href={hackathon.registerLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center px-4 py-2 bg-primary dark:bg-primary-dark text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-all">
            <span>Register Now</span>
            <ExternalLinkIcon className="w-4 h-4 ml-2" />
          </a>
        </footer>
      </motion.div>
    </div>
  );
};

const Toast: React.FC<{ message: string; show: boolean; onDismiss: () => void; }> = ({ message, show, onDismiss }) => {
    useEffect(() => {
        if(show) {
            const timer = setTimeout(() => onDismiss(), 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    return (
        <AnimatePresence>
        {show && (
            <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
            {message}
            </motion.div>
        )}
        </AnimatePresence>
    );
}

const Footer: React.FC<{onFeedbackSubmit: (e: React.FormEvent<HTMLFormElement>) => void}> = ({ onFeedbackSubmit }) => (
  <motion.footer custom={3} variants={{hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.6 }}}} initial="hidden" animate="visible" className="bg-surface dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-lg">HackMatch</h4>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark max-w-sm">The best place for college students to find hackathons and build amazing teams. Powered by AI for smarter matching.</p>
        </div>
        <div>
          <h4 className="font-bold text-lg">Send us feedback</h4>
          <form onSubmit={onFeedbackSubmit} className="mt-2 flex flex-col sm:flex-row gap-2">
            <input required type="text" placeholder="Your feedback or bug report..." className="flex-grow w-full px-3 py-2 bg-background dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
            <button type="submit" className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">Send</button>
          </form>
        </div>
      </div>
       <div className="mt-8 text-center text-sm text-text-secondary dark:text-text-secondary-dark border-t border-border-light dark:border-border-dark pt-6">
        <p>&copy; {new Date().getFullYear()} HackMatch. All rights reserved.</p>
      </div>
    </div>
  </motion.footer>
);


// --- Page Components ---

const LandingPage: React.FC<{ onNavigateToSignup: () => void; theme: Theme; toggleTheme: () => void; }> = ({ onNavigateToSignup, theme, toggleTheme }) => {
  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    (e.target as HTMLFormElement).reset();
  };

  const howItWorksItems = [
    { icon: ClipboardListIcon, title: "Browse Hackathons", description: "Discover upcoming, ongoing, and past hackathons from various domains." },
    { icon: UsersIcon, title: "Form Your Team", description: "Create a new team or join an existing one with a unique team code." },
    { icon: LightbulbIcon, title: "Get AI Suggestions", description: "Leverage AI to analyze your team's skills and find the perfect balance." }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'gradient-bg-light' : 'gradient-bg-dark'}`}>
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <header className="container mx-auto px-4 py-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-lg"><SparklesIcon className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-white">HackMatch</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Toggle theme">
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <button onClick={onNavigateToSignup} className="px-4 py-2 bg-white text-primary font-semibold rounded-lg shadow-md hover:bg-slate-100 transition-colors">Sign Up</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center z-10">
        <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.6 }}>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white shadow-lg">Find Your Team.</h2>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white shadow-lg mt-2">Build Your Dream.</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">The ultimate platform for college students to discover hackathons, form balanced teams with AI-powered suggestions, and unleash their creativity.</p>
                <button onClick={onNavigateToSignup} className="mt-8 px-8 py-3 bg-white text-primary text-lg font-bold rounded-full shadow-xl hover:bg-slate-100 transition-transform transform hover:scale-105">Get Started Now</button>
            </motion.div>
        </div>
      </main>

       <section className="py-16 bg-background dark:bg-background-dark z-10">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-10">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorksItems.map((item, index) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2 }} viewport={{ once: true }} className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark text-center shadow-sm">
                  <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                    <item.icon className="w-8 h-8 text-primary dark:text-primary-dark" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                  <p className="text-text-secondary dark:text-text-secondary-dark">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
       </section>

      <section className="py-16 bg-background dark:bg-background-dark z-10">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-10 text-center">Tech Buzz Preview</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {MOCK_ARTICLES.slice(0, 4).map((article) => (
              <a href={article.link} key={article.id} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-72 bg-surface dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-text-primary dark:text-text-primary-dark">{article.title}</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">{article.source} · {article.publishedDate}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer onFeedbackSubmit={handleFeedbackSubmit} />
    </div>
  );
};


const SignupPage: React.FC<{onSignup: (user: User) => void; theme: Theme; toggleTheme: () => void;}> = ({ onSignup, theme, toggleTheme }) => {
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd collect form data. For this prototype, we'll create a new mock user.
    const newUser: User = {
        ...MOCK_USERS[0], // Base on a mock user
        id: Date.now(),
        name: (e.target as any).elements.name.value || 'New Hacker',
        college: (e.target as any).elements.college.value || 'Code University',
        email: (e.target as any).elements.email.value || 'hacker@code.edu',
        skills: ((e.target as any).elements.skills.value || 'React,Node.js').split(',').map((s:string) => s.trim()),
    };
    onSignup(newUser);
  };
    
  const onOAuthLogin = () => {
    onSignup(MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]);
  }

  return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative ${theme === 'light' ? 'gradient-bg-light' : 'gradient-bg-dark'}`}>
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="absolute top-4 right-4">
          <button onClick={toggleTheme} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-surface/50 dark:bg-surface-dark/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md text-center z-10"
          >
            <SparklesIcon className="w-12 h-12 text-primary dark:text-primary-dark mx-auto" />
            <h1 className="text-4xl font-bold mt-4 text-text-primary dark:text-text-primary-dark">Create Your Account</h1>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark mt-2">Join the next generation of innovators.</p>
            
            <form onSubmit={handleFormSubmit} className="mt-8 text-left space-y-4">
               <div>
                 <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Full Name</label>
                 <input name="name" type="text" required placeholder="Ada Lovelace" className="mt-1 w-full px-3 py-2 bg-background/70 dark:bg-background-dark/70 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
               </div>
                <div>
                 <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Email Address</label>
                 <input name="email" type="email" required placeholder="ada@example.com" className="mt-1 w-full px-3 py-2 bg-background/70 dark:bg-background-dark/70 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
               </div>
               <div>
                 <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">College / University</label>
                 <input name="college" type="text" required placeholder="University of London" className="mt-1 w-full px-3 py-2 bg-background/70 dark:bg-background-dark/70 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
               </div>
               <div>
                 <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Skills (comma-separated)</label>
                 <input name="skills" type="text" required placeholder="React, Python, Figma" className="mt-1 w-full px-3 py-2 bg-background/70 dark:bg-background-dark/70 border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
               </div>
              <button type="submit" className="w-full px-4 py-3 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-colors">Create Account</button>
            </form>
            
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-light dark:border-border-dark"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark">Or continue with</span></div></div>

            <div className="space-y-4">
              <button onClick={onOAuthLogin} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700/50 border border-border-light dark:border-border-dark text-text-primary dark:text-text-primary-dark font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <GoogleIcon className="w-5 h-5" /> Continue with Google
              </button>
               <button onClick={onOAuthLogin} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-900 transition-colors">
                <GitHubIcon className="w-5 h-5" /> Continue with GitHub
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
  );
};


const Dashboard: React.FC<{ currentUser: User, onLogout: () => void, theme: Theme, toggleTheme: () => void }> = ({ currentUser, onLogout, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState<HackathonStatus>('Upcoming');
  
  const [teams, setTeams] = useLocalStorage<Team[]>('hackmatch_teams', []);
  
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const handleOpenTeamModal = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setIsTeamModalOpen(true);
  };
  
  const handleOpenDetailModal = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setIsDetailModalOpen(true);
  };
  
  const closeModal = () => {
    setIsTeamModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedHackathon(null);
  };

  const handleCreateTeam = (teamName: string) => {
    if (!selectedHackathon) return;
    const newTeam: Team = {
      id: Date.now(),
      name: teamName,
      members: [currentUser],
      teamCode: generateTeamCode(),
      hackathonId: selectedHackathon.id,
    };
    setTeams([...teams, newTeam]);
    setToastMessage(`Team "${teamName}" created!`);
    setShowToast(true);
  };
  
  const handleJoinTeam = (teamCode: string) => {
    if (!selectedHackathon) return;
    if (teams.length > 0) {
      setTeams(prev => {
        const updatedTeams = [...prev];
        const teamToJoin = updatedTeams[0]; // Just join the first team for demo
        if (!teamToJoin.members.some(m => m.id === currentUser.id)) {
            teamToJoin.members.push(currentUser);
            setToastMessage(`Joined team "${teamToJoin.name}"!`);
            setShowToast(true);
        }
        return updatedTeams;
      });
    } else {
        alert("No teams available to join. Create one first!");
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((e.currentTarget.elements[0] as HTMLInputElement).value.trim()) {
        (e.currentTarget.elements[0] as HTMLInputElement).value = '';
        setToastMessage("Thanks for your feedback!");
        setShowToast(true);
    }
  };
  
  const filteredHackathons = useMemo(() => MOCK_HACKATHONS.filter(h => h.status === activeTab), [activeTab]);
  const currentTeam = useMemo(() => teams.find(t => t.hackathonId === selectedHackathon?.id), [teams, selectedHackathon]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark font-sans">
      <Header theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />
      
      <main className="container mx-auto p-4 md:p-8">
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="bg-surface dark:bg-surface-dark rounded-xl p-6 mb-8 border border-border-light dark:border-border-dark text-center shadow-sm">
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">Welcome, {currentUser.name}!</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">Discover hackathons, build your dream team, and create something amazing.</p>
        </motion.div>

        <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <h3 className="text-2xl font-bold mb-4">Hackathons</h3>
          <div className="border-b border-border-light dark:border-border-dark mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {(['Upcoming', 'Ongoing', 'Past'] as HackathonStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab ? 'border-primary dark:border-primary-dark text-primary dark:text-primary-dark' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300 dark:hover:text-text-primary-dark dark:hover:border-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <AnimatePresence>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} onViewDetails={handleOpenDetailModal} onManageTeam={handleOpenTeamModal} hasTeam={teams.some(t => t.hackathonId === hackathon.id)}/>
            ))}
          </motion.div>
          </AnimatePresence>
        </motion.section>

        <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mt-12">
           <h3 className="text-2xl font-bold mb-4">Tech Buzz</h3>
           <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
             {MOCK_ARTICLES.map((article) => (
              <a href={article.link} key={article.id} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-72 bg-surface dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-text-primary dark:text-text-primary-dark">{article.title}</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">{article.source} · {article.publishedDate}</p>
              </a>
             ))}
           </div>
        </motion.section>
      </main>

      <Footer onFeedbackSubmit={handleFeedbackSubmit} />

      <AnimatePresence>
        {isTeamModalOpen && (
          <TeamModal 
            isOpen={isTeamModalOpen}
            onClose={closeModal}
            hackathon={selectedHackathon}
            team={currentTeam}
            currentUser={currentUser}
            onCreateTeam={handleCreateTeam}
            onJoinTeam={handleJoinTeam}
          />
        )}
        {isDetailModalOpen && (
          <HackathonDetailModal hackathon={selectedHackathon} onClose={closeModal}/>
        )}
      </AnimatePresence>
      <Toast message={toastMessage} show={showToast} onDismiss={() => setShowToast(false)} />
    </div>
  );
};


// --- Main App Component ---

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('hackmatch_user', null);
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'landing';
    const storedUser = window.localStorage.getItem('hackmatch_user');
    return storedUser && storedUser !== 'null' ? 'dashboard' : 'landing';
  });
  
  const [theme, setTheme] = useLocalStorage<Theme>('hackmatch_theme', 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleSignup = (newUser: User) => {
    setCurrentUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hackmatch_teams');
    setView('landing');
  };

  switch (view) {
    case 'signup':
      return <SignupPage onSignup={handleSignup} theme={theme} toggleTheme={toggleTheme} />;
    case 'dashboard':
      return <Dashboard currentUser={currentUser!} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    case 'landing':
    default:
      return <LandingPage onNavigateToSignup={() => setView('signup')} theme={theme} toggleTheme={toggleTheme} />;
  }
};
