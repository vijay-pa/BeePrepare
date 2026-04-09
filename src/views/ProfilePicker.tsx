import { useState, useEffect } from 'react';
import { UserPlus, UserCircle, ArrowRight } from 'lucide-react';

interface ProfilePickerProps {
  onProfileSelect: (profileName: string) => void;
}

export default function ProfilePicker({ onProfileSelect }: ProfilePickerProps) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('BEE_PREPARE_PROFILES');
    if (saved) {
      setProfiles(JSON.parse(saved));
    }
  }, []);

  const addProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim() && !profiles.includes(newProfileName.trim())) {
      const updated = [...profiles, newProfileName.trim()];
      setProfiles(updated);
      localStorage.setItem('BEE_PREPARE_PROFILES', JSON.stringify(updated));
      onProfileSelect(newProfileName.trim());
    }
  };

  return (
    <div className="flex-col items-center justify-center gap-8 w-full" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <h1 className="title" style={{ fontSize: '4rem' }}>Welcome! 🐝</h1>
        <h2 className="subtitle" style={{ fontSize: '2rem' }}>Who is practicing today?</h2>
      </div>

      <div className="flex-row gap-6 flex-wrap justify-center" style={{ maxWidth: '800px' }}>
        {profiles.map(name => (
          <button 
            key={name}
            className="card flex-col items-center justify-center gap-4 hover-lift"
            style={{ width: '180px', height: '180px', cursor: 'pointer', border: '3px solid var(--color-primary)' }}
            onClick={() => onProfileSelect(name)}
          >
            <div style={{ backgroundColor: 'var(--color-secondary)', padding: '1rem', borderRadius: '50%' }}>
              <UserCircle size={64} color="var(--color-primary)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-neutral)' }}>{name}</span>
          </button>
        ))}

        <button 
          className="card flex-col items-center justify-center gap-4 hover-lift"
          style={{ width: '180px', height: '180px', cursor: 'pointer', border: '3px dashed var(--color-neutral)', opacity: 0.8 }}
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus size={64} color="var(--color-neutral)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-neutral)' }}>New Profile</span>
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay flex-row items-center justify-center">
          <div className="card w-full" style={{ maxWidth: '400px' }}>
            <h2 className="subtitle">Enter your name:</h2>
            <form onSubmit={addProfile} className="flex-col gap-4">
              <input 
                type="text" 
                className="input-field" 
                autoFocus
                placeholder="Ex. Sam"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <div className="flex-row gap-3">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Let's Go! <ArrowRight size={20} /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
