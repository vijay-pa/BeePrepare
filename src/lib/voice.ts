let preferredVoice: SpeechSynthesisVoice | null = null;

export const initVoices = () => {
  if (!('speechSynthesis' in window)) return;

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    // Ordered by human-like quality preference across browsers
    const preferredNames = [
      'Google US English',
      'Google UK English Female',
      'Alex', // Premium macOS
      'Samantha', // Standard macOS
      'Karen',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Zira' // Standard Windows
    ];

    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name) || v.name === name);
      if (voice) {
        preferredVoice = voice;
        return;
      }
    }

    // Fallback if no exact match found
    preferredVoice = voices.find(v => v.lang === 'en-US') 
                  || voices.find(v => v.lang.startsWith('en')) 
                  || voices[0];
  };

  setVoice();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = setVoice;
  }
};

export const playPronunciation = (text: string) => {
  if (!('speechSynthesis' in window) || !text) return;

  // Cancel any ongoing speech so it doesn't queue up weirdly
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (!preferredVoice) {
    // try to init just in case it was missed
    initVoices();
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Adjust to sound more natural (slowed down slightly for clarity)
  utterance.rate = 0.85; 
  utterance.pitch = 1.0; 

  window.speechSynthesis.speak(utterance);
};
