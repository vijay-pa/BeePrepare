# 🐝 BeePrepare

**BeePrepare** is an AI-powered spelling bee preparation app designed to help kids master their spelling lists with confidence. By using advanced AI (Groq), it provides rich, kid-friendly context for every word, turning a chore into an interactive learning adventure.

## ✨ Features

- **Profile Management**: Support for multiple students with personalized progress tracking.
- **AI-Powered Learning**: Get instant, kid-friendly definitions, origins, roots, and fun facts for any word using the Groq API.
- **Learning Mode**: Step-by-step review of words with pronunciation and AI-generated context.
- **Test Mode**: Simulates a real spelling bee with scoring, progress tracking, and a supportive retest flow for missed words.
- **Bulk Import**: Quickly upload entire word lists via Excel (`.xlsx`) or enter them manually.
- **Smart Sorting**: AI helps you prioritize words based on how frequently they appear in real spelling bees.

## 🚀 Tech Stack

- **Frontend**: React (with Vite)
- **Styling**: Vanilla CSS with a focus on modern, friendly aesthetics.
- **AI Integration**: [Groq SDK](https://groq.com/) (using `llama-3.1-8b-instant`)
- **Excel Parsing**: `xlsx` library
- **Icons**: Lucide React

## 🛠️ Prerequisites

To use the AI features (definitions and sorting), you will need a **Groq API Key**.
1. Get a free key at [console.groq.com](https://console.groq.com/).
2. Enter the key directly into the app when prompted (it is stored safely in your browser's local storage).

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/beeprepare.git
   cd beeprepare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🚢 Deployment

This app is a static site and can be hosted for free on platforms like **Vercel**, **Netlify**, or **GitHub Pages**.

### Deploying to Vercel (Recommended)
1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. It will automatically build and deploy!

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ for future spelling champions.*

**Live Site**: [bee-prepare.vercel.app](https://bee-prepare.vercel.app)
