import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Edit3, ArrowLeft } from 'lucide-react';

interface ModeSelectProps {
  words: string[];
}

export default function ModeSelect({ words }: ModeSelectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (words.length === 0) {
      navigate('/');
    }
  }, [words, navigate]);

  return (
    <div className="flex-col items-center gap-8 w-full">
      <div className="w-full" style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <h1 className="title" style={{ fontSize: '3.5rem', margin: '0' }}>
        What do you want to do?
      </h1>
      
      <div className="subtitle" style={{ marginBottom: '2rem' }}>
        You have {words.length} word{words.length !== 1 && 's'} in your list!
      </div>
      
      <div className="flex-col gap-6 w-full" style={{ maxWidth: '400px' }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '2rem', fontSize: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onClick={() => navigate('/learn')}
        >
          <BookOpen size={48} />
          Learn Mode
          <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.9 }}>
            Discover meanings, history, and practice pronunciation!
          </span>
        </button>

        <button 
          className="btn btn-secondary" 
          style={{ padding: '2rem', fontSize: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onClick={() => navigate('/test')}
        >
          <Edit3 size={48} />
          Test Mode
          <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.9 }}>
            Challenge yourself to spell the words correctly!
          </span>
        </button>
      </div>
    </div>
  );
}
