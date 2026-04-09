import Groq from "groq-sdk";

export interface WordInfo {
  definition: string;
  history: string;
  example: string;
  root: string;
  tidbit: string;
}

export const getGroqApiKey = () => {
  return localStorage.getItem('GROQ_API_KEY') || '';
};

export const setGroqApiKey = (key: string) => {
  localStorage.setItem('GROQ_API_KEY', key);
};

export const fetchWordInfo = async (word: string): Promise<WordInfo> => {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    throw new Error("Missing API Key");
  }

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `You are a fun, friendly teacher for kids. Tell me about the word "${word}". 
Return ONLY a JSON object with these exactly five keys, and keep your explanations very simple, kid-friendly, and short.
"definition": A kid-friendly definition.
"history": A super fun fact about where the word came from.
"example": A fun example sentence using the word.
"root": The root origin of the word (like Latin or Greek parts).
"tidbit": A neat, surprising tidbit or fun fact about the word.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as WordInfo;
  } catch (error) {
    console.error("Failed to fetch word info:", error);
    throw error;
  }
};

export const sortWordsByBeeFrequency = async (words: string[]): Promise<string[]> => {
  if (words.length === 0) return [];
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    throw new Error("Missing API Key");
  }

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `You are a spelling bee expert. I have a list of words. Please sort these words by how frequently they are asked in spelling bees, from most frequent to least frequent.
List of words: ${words.join(', ')}

Return ONLY a JSON object containing a single key "sorted_words" whose value is an array of strings in the sorted order. Do not include any other text.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);
    return result.sorted_words || words;
  } catch (error) {
    console.error("Failed to sort words:", error);
    throw error;
  }
};
