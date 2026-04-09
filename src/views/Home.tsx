import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, Sparkles, Key, RotateCcw } from 'lucide-react';
import { sortWordsByBeeFrequency, getGroqApiKey, setGroqApiKey } from '../lib/api';
import * as XLSX from 'xlsx';

interface HomeProps {
  setWords: React.Dispatch<React.SetStateAction<string[]>>;
  activeProfile: string;
  setInitialIndex: (index: number) => void;
}

export default function Home({ setWords, activeProfile, setInitialIndex }: HomeProps) {
  const [textInput, setTextInput] = useState('');
  const [isSorting, setIsSorting] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [pendingWords, setPendingWords] = useState<string[]>([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedIndex, setSavedIndex] = useState(0);

  const navigate = useNavigate();

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const extractWords = (text: string) => {
    return text
      .split(/[\n, ]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
  };

  const checkProgress = (uniqueWords: string[]) => {
    const hash = getListHash(uniqueWords);
    const progressKey = `BEE_PREPARE_PROGRESS_${activeProfile}_${hash}`;
    const saved = localStorage.getItem(progressKey);
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.index > 0) {
        setSavedIndex(data.index);
        setPendingWords(uniqueWords);
        setShowResumeModal(true);
        return true;
      }
    }
    return false;
  };

  const processWords = (text: string) => {
    const parsedWords = extractWords(text);
    const uniqueWords = [...new Set(parsedWords)];
    
    if (uniqueWords.length > 0) {
      if (!checkProgress(uniqueWords)) {
        setWords(uniqueWords);
        setInitialIndex(0);
        navigate('/mode');
      }
    } else {
      alert("Please enter some words first!");
    }
  };

  const startContinuing = () => {
    setWords(pendingWords);
    setInitialIndex(savedIndex);
    navigate('/mode');
  };

  const startFresh = () => {
    const hash = getListHash(pendingWords);
    const progressKey = `BEE_PREPARE_PROGRESS_${activeProfile}_${hash}`;
    localStorage.removeItem(progressKey);
    
    setWords(pendingWords);
    setInitialIndex(0);
    navigate('/mode');
  };

  const handleSmartSort = async () => {
    const parsedWords = extractWords(textInput);
    const uniqueWords = [...new Set(parsedWords)];
    
    if (uniqueWords.length === 0) {
      alert("Please enter some words to sort first!");
      return;
    }

    if (!getGroqApiKey()) {
      setShowKeyPrompt(true);
      return;
    }

    const MAX_SORT_WORDS = 200;
    const wordsToSort = uniqueWords.slice(0, MAX_SORT_WORDS);
    const wordsToKeep = uniqueWords.slice(MAX_SORT_WORDS);

    setIsSorting(true);
    try {
      const sorted = await sortWordsByBeeFrequency(wordsToSort);
      const finalList = [...sorted, ...wordsToKeep];
      setTextInput(finalList.join('\n'));
      
      if (uniqueWords.length > MAX_SORT_WORDS) {
        setTimeout(() => alert(`Words sorted ✨! The hardest ones are now first. (Only the first ${MAX_SORT_WORDS} were sorted via AI to respect free tier limits)`), 100);
      } else {
        setTimeout(() => alert("Words sorted ✨! The hardest/most frequent ones are now first!"), 100);
      }
    } catch (e: any) {
      if (e.message === "Missing API Key") {
        setShowKeyPrompt(true);
      } else {
        alert(`Failed to sort words: ${e.message || e.toString()}`);
      }
    } finally {
      setIsSorting(false);
    }
  };

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGroqApiKey(apiKeyInput.trim());
      setShowKeyPrompt(false);
      handleSmartSort();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      if (isExcel) {
        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
          alert("We couldn't find any words in that file!");
          return;
        }

        const frequentWords: string[] = [];
        const otherWords: string[] = [];

        json.forEach(row => {
          const wordVal = row.word || row.raw_word || row.Word || row.WORD;
          if (!wordVal) return;
          
          const cleanWord = String(wordVal).trim().toLowerCase();
          if (!cleanWord) return;

          const freqTier = row.frequency_tier || row.Frequency_Tier || row.frequency;
          const isFrequent = String(freqTier).toLowerCase().includes('most_frequent') || 
                             String(row.is_most_frequent).toLowerCase() === 'true';

          if (isFrequent) {
            frequentWords.push(cleanWord);
          } else {
            otherWords.push(cleanWord);
          }
        });

        const finalList = [...new Set([...frequentWords, ...otherWords])];
        setTextInput(finalList.join('\n'));
        alert(`Successfully loaded ${finalList.length} words! We've prioritized the "most-frequent" ones at the top. ✨`);
      } else {
        setTextInput(result as string);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processWords(textInput);
  };

  if (showKeyPrompt) {
    return (
      <div className="flex-col items-center justify-center gap-6 w-full" style={{ marginTop: '2rem' }}>
        <h1 className="title">Parents! We need a magic key! 🗝️</h1>
        {/* ... (Existing Key Prompt UI) */}
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            To magically sort words via AI, we securely use the Groq AI service in your browser.
          </p>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Enter your Groq API Key..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={saveApiKey}>
            <Key size={20} /> Save Key & Sort
          </button>
          <button className="btn btn-outline" style={{ marginTop: '1rem', marginLeft: '1rem' }} onClick={() => setShowKeyPrompt(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col items-center justify-center gap-8 w-full">
      <h1 className="title" style={{ fontSize: '4rem', marginTop: '1rem' }}>
        Bee Prepare! 🐝
      </h1>
      
      <div className="card w-full text-center">
        <h2 className="subtitle">Let's learn some new words!</h2>
        
        <form onSubmit={handleSubmit} className="flex-col gap-6">
          <textarea
            className="input-area"
            placeholder="Paste your spelling list here, or upload your Excel file below!"
            value={textInput}
            onChange={handleTextChange}
          />
          
          <div className="flex-col items-center gap-2">
            <span style={{ color: 'var(--color-neutral)', fontWeight: 'bold' }}>OR</span>
            <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <Upload size={20} />
              Choose an Excel, CSV, or Text file
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv, .txt" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <div className="flex-row items-center justify-center gap-4" style={{ marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              disabled={!textInput.trim() || isSorting}
              onClick={handleSmartSort}
            >
              <Sparkles size={24} />
              {isSorting ? "Sorting..." : "Smart Sort"}
            </button>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!textInput.trim()}
            >
              Start Learning
              <ArrowRight size={24} />
            </button>
          </div>
        </form>
      </div>

      {showResumeModal && (
        <div className="modal-overlay flex-row items-center justify-center">
          <div className="card w-full text-center" style={{ maxWidth: '500px', gap: '2rem' }}>
            <h1 className="title" style={{ fontSize: '3rem' }}>Welcome Back, {activeProfile}! 🌟</h1>
            <p style={{ fontSize: '1.25rem' }}>
              It looks like you were already working on this list. You were on word <strong>#{savedIndex + 1}</strong>.
            </p>
            <div className="flex-col gap-4">
              <button className="btn btn-primary w-full" style={{ padding: '1.5rem', fontSize: '1.5rem' }} onClick={startContinuing}>
                Pick Up Where I Left Off! <ArrowRight size={24} />
              </button>
              <button className="btn btn-outline w-full" onClick={startFresh}>
                <RotateCcw size={20} /> Start Over from the Beginning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
