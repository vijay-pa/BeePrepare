import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './views/Home';
import ModeSelect from './views/ModeSelect';
import LearnMode from './views/LearnMode';
import TestMode from './views/TestMode';
import ProfilePicker from './views/ProfilePicker';
import { initVoices } from './lib/voice';
import { UserCircle, LogOut } from 'lucide-react';
import './App.css';

export interface SavedProgress {
  listHash: string;
  lastIndex: number;
  testResults: any[];
}

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    initVoices();
    const savedProfile = localStorage.getItem('BEE_PREPARE_ACTIVE_PROFILE');
    if (savedProfile) {
      setActiveProfile(savedProfile);
    }
  }, []);

  const handleProfileSelect = (name: string) => {
    setActiveProfile(name);
    localStorage.setItem('BEE_PREPARE_ACTIVE_PROFILE', name);
  };

  const handleLogout = () => {
    setActiveProfile(null);
    localStorage.removeItem('BEE_PREPARE_ACTIVE_PROFILE');
  };

  if (!activeProfile) {
    return (
      <div className="app-container">
        <ProfilePicker onProfileSelect={handleProfileSelect} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <BrowserRouter>
        {/* Global Header */}
        <header className="flex-row justify-between items-center w-full" style={{ padding: '1rem 2rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)' }}>🐝 Bee Prepare</h1>
          </Link>
          <div className="flex-row items-center gap-4">
            <div className="flex-row items-center gap-2" style={{ fontWeight: 'bold', color: 'var(--color-neutral)' }}>
              <UserCircle size={24} color="var(--color-primary)" />
              {activeProfile}
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-outline" 
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderColor: '#cbd5e1', color: '#64748b' }}
            >
              <LogOut size={14} /> Switch
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home setWords={setWords} activeProfile={activeProfile} setInitialIndex={setInitialIndex} />} />
          <Route path="/mode" element={<ModeSelect words={words} />} />
          <Route path="/learn" element={<LearnMode words={words} activeProfile={activeProfile} initialIndex={initialIndex} />} />
          <Route path="/test" element={<TestMode words={words} activeProfile={activeProfile} initialIndex={initialIndex} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
