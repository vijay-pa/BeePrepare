import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, ArrowLeft, Mic, Pencil, Keyboard, CheckCircle, XCircle, Trophy, RotateCcw, HelpCircle, LogOut } from 'lucide-react';
import ScratchPad from '../components/ScratchPad';
import { playPronunciation as playVoice } from '../lib/voice';

interface TestModeProps {
  words: string[];
  activeProfile: string;
  initialIndex: number;
}

type InputMethod = 'draw' | 'type' | 'speak';

interface WordResult {
  word: string;
  correct: boolean;
  practiced: boolean;
}

export default function TestMode({ words, activeProfile, initialIndex }: TestModeProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [inputMethod, setInputMethod] = useState<InputMethod>('draw');
  
  const [typedAnswer, setTypedAnswer] = useState('');
  const [spokenAnswer, setSpokenAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [showResult, setShowResult] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [testResults, setTestResults] = useState<WordResult[]>([]);
  const [showReport, setShowReport] = useState(false);

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

    // Load existing results if any
    const hash = getListHash(words);
    const progressKey = `BEE_PREPARE_PROGRESS_${activeProfile}_${hash}`;
    const saved = localStorage.getItem(progressKey);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.testResults) {
        setTestResults(data.testResults);
      }
    }
  }, [words, navigate, activeProfile]);

  const word = words[currentIndex] || '';

  useEffect(() => {
    setTypedAnswer('');
    setSpokenAnswer('');
    setShowResult(false);
    setIsPracticing(false);
    if (word && !showReport) {
      playVoice(word);
    }
  }, [currentIndex, word, showReport]);

  const isCorrect = (answer: string) => {
    const cleanAnswer = answer.toLowerCase().replace(/[\s.]/g, '');
    const cleanWord = word.toLowerCase().replace(/[\s]/g, '');
    return cleanAnswer === cleanWord;
  };

  const saveProgress = (newResults: WordResult[], newIndex: number) => {
    const hash = getListHash(words);
    const progressKey = `BEE_PREPARE_PROGRESS_${activeProfile}_${hash}`;
    const existing = localStorage.getItem(progressKey);
    const data = existing ? JSON.parse(existing) : {};
    
    localStorage.setItem(progressKey, JSON.stringify({
      ...data,
      index: newIndex,
      testResults: newResults,
      listHash: hash,
      updatedAt: new Date().toISOString()
    }));
  };

  const checkAnswer = () => {
    const answer = inputMethod === 'type' ? typedAnswer : spokenAnswer;
    const correct = inputMethod === 'draw' ? true : isCorrect(answer);
    
    const newResult: WordResult = {
      word,
      correct,
      practiced: isPracticing
    };

    const updatedResults = [...testResults];
    const existingIndex = updatedResults.findIndex(r => r.word === word);
    if (existingIndex >= 0) {
      updatedResults[existingIndex] = newResult;
    } else {
      updatedResults.push(newResult);
    }

    setTestResults(updatedResults);
    saveProgress(updatedResults, currentIndex);
    setShowResult(true);
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveProgress(testResults, nextIdx);
    } else {
      setShowReport(true);
    }
  };

  const startPractice = () => {
    setIsPracticing(true);
    playVoice(word);
  };

  const retryWord = () => {
    setTypedAnswer('');
    setSpokenAnswer('');
    setShowResult(false);
  };

  const finishTest = () => {
    setShowReport(true);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    if (isListening) return;
    // @ts-expect-error
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setSpokenAnswer(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (showReport) {
    const attemptedCount = testResults.length;
    const correctCount = testResults.filter(r => r.correct).length;
    const score = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    return (
      <div className="flex-col items-center w-full" style={{ marginTop: '0rem' }}>
        <h1 className="title" style={{ fontSize: '4rem' }}>Amazing Job! 🌟</h1>
        <div className="card w-full text-center" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex-col items-center gap-2">
            <div style={{ backgroundColor: 'var(--color-secondary)', padding: '2rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem' }}>
              <Trophy size={64} color="var(--color-primary)" />
            </div>
            <h2 style={{ fontSize: '3rem', margin: 0 }}>{score}%</h2>
            <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>{correctCount} out of {attemptedCount} correct!</p>
            {attemptedCount < words.length && (
              <p style={{ fontSize: '1rem', opacity: 0.5 }}>
                (List progress: {attemptedCount} / {words.length} words)
              </p>
            )}
          </div>

          <div style={{ textAlign: 'left', maxHeight: '300px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-neutral)' }}>Word History:</h3>
            <div className="flex-col gap-2">
              {testResults.map((res, i) => (
                <div key={i} className="flex-row justify-between items-center" style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.2rem', textTransform: 'capitalize', fontWeight: 'bold' }}>{res.word}</span>
                  <div className="flex-row gap-2">
                    {res.correct && !res.practiced ? (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                        <CheckCircle size={18} /> CORRECT
                      </span>
                    ) : res.practiced && res.correct ? (
                      <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                        <RotateCcw size={18} /> PRACTICED
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                        <XCircle size={18} /> MISSED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-col gap-4">
            <button className="btn btn-primary w-full" onClick={() => navigate('/')}>New List</button>
            <button className="btn btn-outline w-full" onClick={() => { setTestResults([]); setCurrentIndex(0); setShowReport(false); saveProgress([], 0); }}>Reset & Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const currentIsCorrect = isCorrect(inputMethod === 'type' ? typedAnswer : spokenAnswer);

  return (
    <div className="flex-col items-center w-full" style={{ marginTop: '0rem' }}>
      <div className="w-full flex-row justify-between items-center" style={{ marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={() => navigate('/mode')}>
          <ArrowLeft size={16} /> Mode
        </button>
        <div style={{ fontWeight: 'bold', color: 'var(--color-neutral)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <span style={{ opacity: 0.6 }}>{currentIndex + 1} / {words.length}</span>
           <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={finishTest}><LogOut size={14} /> Finish</button>
        </div>
      </div>

      <div className="card w-full text-center" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h2 style={{ margin: 0 }}>Spell the word!</h2>
          {isPracticing && <div style={{ color: '#8b5cf6', fontWeight: '900', fontSize: '1rem' }}>✏️ PRACTICE MODE</div>}
        </div>

        <button className="btn btn-primary" onClick={() => playVoice(word)} style={{ padding: '1rem 3rem', fontSize: '2rem', borderRadius: 'var(--radius-full)' }}>
          <PlayCircle size={40} /> Hear Word
        </button>

        {!showResult && (
          <div className="flex-row gap-4 justify-center mt-4">
            <button className={`btn ${inputMethod === 'draw' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputMethod('draw')}><Pencil size={20} /> Draw</button>
            <button className={`btn ${inputMethod === 'type' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputMethod('type')}><Keyboard size={20} /> Type</button>
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <button className={`btn ${inputMethod === 'speak' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInputMethod('speak')}><Mic size={20} /> Speak</button>
            )}
          </div>
        )}

        <div className="w-full mt-4 flex-col items-center gap-4">
          {inputMethod === 'draw' && <ScratchPad />}
          {inputMethod === 'type' && (
            <input type="text" className="input-field" style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '4px', borderColor: showResult ? (currentIsCorrect ? 'var(--color-success)' : 'var(--color-error)') : '#e2e8f0' }}
                   placeholder="TYPE HERE..." value={typedAnswer} autoFocus autoComplete="off" autoCorrect="off" 
                   onChange={(e) => setTypedAnswer(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && typedAnswer.trim() && !showResult && checkAnswer()} disabled={showResult} />
          )}
          {inputMethod === 'speak' && (
             <div className="flex-col items-center gap-4">
               <button className="btn btn-outline" style={{ padding: '2rem', borderRadius: '50%', background: isListening ? 'rgba(248, 113, 113, 0.1)' : 'transparent', borderColor: isListening ? 'var(--color-error)' : 'var(--color-primary)' }}
                       onClick={toggleListening} disabled={showResult}>
                 <Mic size={48} color={isListening ? 'var(--color-error)' : 'var(--color-primary)'} />
               </button>
               <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px', color: showResult ? (currentIsCorrect ? 'var(--color-success)' : 'var(--color-error)') : 'inherit' }}>
                 {spokenAnswer.toUpperCase().split('').join(' ')}
               </div>
             </div>
          )}
        </div>

        {!showResult ? (
          <button className="btn btn-secondary mt-4 w-full" onClick={checkAnswer} disabled={inputMethod !== 'draw' && !(typedAnswer || spokenAnswer)}>Check Answer!</button>
        ) : (
          <div className="flex-col items-center gap-4 w-full" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '2px dashed #cbd5e1' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--color-neutral)', opacity: 0.8 }}>The magic word is:</div>
            <h1 style={{ fontSize: '4.5rem', color: 'var(--color-primary)', margin: '0.5rem 0', textTransform: 'uppercase', letterSpacing: '8px' }}>{word}</h1>
            {inputMethod !== 'draw' && (
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: currentIsCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                {currentIsCorrect ? <><CheckCircle size={32} /> NAIL'D IT!</> : <><XCircle size={32} /> NOT QUITE!</>}
              </div>
            )}
            <div className="flex-col gap-3 w-full mt-2">
              <button className="btn btn-primary w-full" onClick={nextWord} style={{ padding: '1.25rem' }}>{currentIndex === words.length - 1 ? 'See Final Report 🏆' : 'Next Word'} <ArrowRight size={24} /></button>
              {!currentIsCorrect && inputMethod !== 'draw' && (
                <div className="flex-row gap-3 w-full">
                  <button className="btn btn-secondary flex-1" onClick={startPractice} style={{ backgroundColor: '#8b5cf6', color: 'white' }}><HelpCircle size={20} /> Practice</button>
                  <button className="btn btn-outline flex-1" onClick={retryWord}><RotateCcw size={20} /> Retest</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
