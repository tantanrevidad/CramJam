import React, { useState, useEffect } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { Dashboard } from './components/Dashboard';
import { QuizConfig, Question, UserAnswer, Deck } from './types';
import { generateQuiz } from './lib/gemini';
import { Brain, Library, Sun, Moon } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';

type AppState = 'dashboard' | 'upload' | 'config' | 'quiz' | 'results';

export default function App() {
  const { isDark, toggleDark } = useDarkMode();
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<UserAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  
  const [decks, setDecks] = useState<Deck[]>([]);

  // Load decks from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notequiz_decks');
    if (saved) {
      try {
        setDecks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load decks", e);
      }
    }
  }, []);

  // Save decks to local storage when they change
  useEffect(() => {
    localStorage.setItem('notequiz_decks', JSON.stringify(decks));
  }, [decks]);

  const handleUpload = (file: File) => {
    setPdfFile(file);
    setAppState('config');
  };

  const handleStartQuiz = async (quizConfig: QuizConfig) => {
    if (!pdfFile) return;
    
    setConfig(quizConfig);
    setIsGenerating(true);
    setIsStudyMode(false); // Fresh generation is not study mode
    
    try {
      const generatedQuestions = await generateQuiz(pdfFile, quizConfig);
      setQuestions(generatedQuestions);
      setAppState('quiz');
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = (userResults: UserAnswer[]) => {
    setResults(userResults);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('upload');
    setPdfFile(null);
    setConfig(null);
    setQuestions([]);
    setResults([]);
    setIsStudyMode(false);
  };

  const handleNewQuizSameMaterial = () => {
    setAppState('config');
    setQuestions([]);
    setResults([]);
    setIsStudyMode(false);
  };

  const handleSaveDeck = (title: string, deckQuestions: Question[]) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      title,
      createdAt: Date.now(),
      questions: deckQuestions
    };
    setDecks(prev => [newDeck, ...prev]);
  };

  const handleDeleteDeck = (id: string) => {
    if (confirm("Are you sure you want to delete this deck?")) {
      setDecks(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleStudyDeck = (deckQuestions: Question[]) => {
    // When studying an existing deck, we use a default config for the timer/format
    // since the questions are already generated.
    setConfig({
      format: ['Multiple Choice'], // Not strictly used since questions dictate format
      difficulty: 'Medium',
      count: deckQuestions.length,
      focusArea: '',
      timeLimit: 0, // No time limit in study mode by default, or could prompt user
      diagramQuizType: 'None'
    });
    setQuestions(deckQuestions);
    setIsStudyMode(true);
    setAppState('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setAppState('dashboard')}
          >
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">CramJam</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDark}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setAppState('dashboard')}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <Library className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">My Decks</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {appState === 'dashboard' && (
          <Dashboard 
            decks={decks} 
            onStudyDeck={handleStudyDeck} 
            onDeleteDeck={handleDeleteDeck}
            onCreateNew={() => setAppState('upload')}
          />
        )}

        {appState === 'upload' && (
          <UploadScreen onUpload={handleUpload} />
        )}
        
        {appState === 'config' && (
          <ConfigScreen onStart={handleStartQuiz} isGenerating={isGenerating} />
        )}
        
        {appState === 'quiz' && config && questions.length > 0 && (
          <QuizScreen 
            questions={questions} 
            config={config} 
            onComplete={handleComplete} 
            isStudyMode={isStudyMode}
          />
        )}
        
        {appState === 'results' && (
          <ResultScreen 
            results={results} 
            onRestart={handleRestart} 
            onNewQuizSameMaterial={handleNewQuizSameMaterial}
            onSaveDeck={handleSaveDeck}
            onGoToDashboard={() => setAppState('dashboard')}
            hasPdfFile={!!pdfFile}
          />
        )}
      </main>
    </div>
  );
}
