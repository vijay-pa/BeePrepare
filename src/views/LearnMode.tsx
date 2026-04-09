import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, ArrowLeft, Key } from 'lucide-react';
import { fetchWordInfo, getGroqApiKey, setGroqApiKey } from '../lib/api';
import type { WordInfo } from '../lib/api';
import { playPronunciation as playVoice } from '../lib/voice';

interface LearnModeProps {
  words: string[];
  activeProfile: string;
  initialIndex: number;
}

export default function LearnMode({ words, activeProfile, initialIndex }: LearnModeProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(!getGroqApiKey());
  const [apiKeyInput, setApiKeyInput] = useState('');

  const getListHash = (wordsToHash: string[]) => {
    const str = wordsToHash.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  useEffect(() => {
    if (words.length === 0) {
      navigate('/');
    }
  }, [words, navigate]);

  const loadWordInfo = async (word: string) => {
    if (showKeyPrompt) return;
    
    setLoading(true);
    setError(null);
    try {
      const info = await fetchWordInfo(word);
      setWordInfo(info);
    } catch (err: any) {
      if (err.message === "Missing API Key") {
        setShowKeyPrompt(true);
      } else {
        setError("Oops! Couldn't load the magic facts. Need a parent's help!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (words[currentIndex] && !showKeyPrompt) {
      loadWordInfo(words[currentIndex]);
    }
    
    // Save progress
    const hash = getListHash(words);
    const progressKey = `BEE_PREPARE_PROGRESS_${activeProfile}_${hash}`;
    const existing = localStorage.getItem(progressKey);
    const data = existing ? JSON.parse(existing) : {};
    
    localStorage.setItem(progressKey, JSON.stringify({
      ...data,
      index: currentIndex,
      listHash: hash,
      updatedAt: new Date().toISOString()
    }));
  }, [currentIndex, words, showKeyPrompt, activeProfile]);

  const playPronunciation = () => {
    playVoice(words[currentIndex]);
  };

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGroqApiKey(apiKeyInput.trim());
      setShowKeyPrompt(false);
    }
  };

  if (showKeyPrompt) {
    return (
      <div className="flex-col items-center justify-center gap-6 w-full" style={{ marginTop: '2rem' }}>
        <h1 className="title">Parents! We need a magic key! 🗝️</h1>
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            To generate fun facts and kid-friendly definitions, we securely use the Groq AI service in your browser.
          </p>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Enter your Groq API Key..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={saveApiKey}>
            <Key size={20} /> Save Key & Continue
          </button>
        </div>
      </div>
    );
  }

  const word = words[currentIndex];

  return (
    <div className="flex-col items-center w-full" style={{ marginTop: '0rem' }}>
      <div className="w-full flex-row justify-between items-center" style={{ marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={() => navigate('/mode')}>
          <ArrowLeft size={16} /> Mode
        </button>
        <div style={{ fontWeight: 'bold', color: 'var(--color-neutral)' }}>
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="card w-full" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ fontSize: '5rem', color: 'var(--color-primary)', margin: 0, textTransform: 'capitalize' }}>
          {word}
        </h1>

        <button 
          className="btn btn-secondary" 
          onClick={playPronunciation}
          style={{ padding: '1rem 3rem', fontSize: '1.5rem', borderRadius: 'var(--radius-full)' }}
        >
          <PlayCircle size={32} /> Hear Word
        </button>

        <div className="w-full" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--color-tertiary)', fontSize: '1.25rem', marginTop: '2rem' }}>
              ✨ Gathering magic facts... ✨
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--color-error)', fontSize: '1.25rem' }}>
              {error}
            </div>
          ) : wordInfo ? (
            <>
              <div style={{ backgroundColor: '#fffbe1', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-secondary)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>📖 Meaning</h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{wordInfo.definition}</p>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-success)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>🗣️ Example</h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>"{wordInfo.example}"</p>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-tertiary)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a' }}>🕰️ Fun History Fact</h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{wordInfo.history}</p>
              </div>

              <div style={{ backgroundColor: '#fae8ff', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid #d946ef' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#701a75' }}>🌱 Word Roots</h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{wordInfo.root}</p>
              </div>

              <div style={{ backgroundColor: '#fff1f2', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid #f43f5e' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#9f1239' }}>✨ Fun Tidbit</h3>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{wordInfo.tidbit}</p>
              </div>
            </>
          ) : null}
        </div>
        
        <div className="flex-row justify-between w-full" style={{ marginTop: '1rem' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            <ArrowLeft size={20} /> Previous
          </button>
          
          <button 
            className="btn btn-primary" 
            disabled={currentIndex === words.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
          >
            Next <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
