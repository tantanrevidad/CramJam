import React, { useEffect, useState } from 'react';
import { UserAnswer, QuizAnalysis, Deck, Question } from '../types';
import { analyzeResults } from '../lib/gemini';
import { Trophy, RotateCcw, CheckCircle2, XCircle, BrainCircuit, TrendingUp, TrendingDown, Lightbulb, Save, Library, FileUp } from 'lucide-react';

interface ResultScreenProps {
  results: UserAnswer[];
  onRestart: () => void;
  onNewQuizSameMaterial: () => void;
  onSaveDeck: (title: string, questions: Question[]) => void;
  onGoToDashboard: () => void;
  hasPdfFile: boolean;
}

export function ResultScreen({ results, onRestart, onNewQuizSameMaterial, onSaveDeck, onGoToDashboard, hasPdfFile }: ResultScreenProps) {
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [deckTitle, setDeckTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Filter out duplicates if it was study mode (where they might answer the same question multiple times)
  // We only care about the final result for the score, or we can just show all attempts.
  // Let's show unique questions for the score, taking their latest attempt.
  const uniqueResultsMap = new Map<string, UserAnswer>();
  results.forEach(r => uniqueResultsMap.set(r.question.id, r));
  const finalResults = Array.from(uniqueResultsMap.values());

  const correctCount = finalResults.filter(r => r.grading.isCorrect).length;
  const percentage = Math.round((correctCount / finalResults.length) * 100);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await analyzeResults(finalResults);
        setAnalysis(result);
      } catch (error) {
        console.error("Failed to analyze:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();
  }, [finalResults]);

  const handleSave = () => {
    if (!deckTitle.trim()) return;
    const questions = finalResults.map(r => r.question);
    onSaveDeck(deckTitle, questions);
    setIsSaved(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      {/* Header Summary */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full mb-6">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Quiz Complete!</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{correctCount}</span> out of {finalResults.length} ({percentage}%)
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {hasPdfFile && (
            <button onClick={onNewQuizSameMaterial} className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              <RotateCcw className="w-5 h-5" />
              <span>New Quiz (Same Material)</span>
            </button>
          )}
          <button onClick={onRestart} className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <FileUp className="w-5 h-5" />
            <span>Upload New Material</span>
          </button>
          <button onClick={onGoToDashboard} className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors">
            <Library className="w-5 h-5" />
            <span>My Decks</span>
          </button>
        </div>
      </div>

      {/* Save Deck Section */}
      {!isSaved ? (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center gap-4 transition-colors">
          <div className="flex-grow w-full">
            <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Save these flashcards to a Deck</label>
            <input 
              type="text" 
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g., Biology Midterm Review"
              className="w-full p-3 border border-indigo-200 dark:border-indigo-700/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={!deckTitle.trim()}
            className="w-full sm:w-auto mt-6 sm:mt-0 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Deck</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold space-x-2 transition-colors">
          <CheckCircle2 className="w-6 h-6" />
          <span>Deck saved successfully!</span>
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center space-x-3 mb-6">
          <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">AI Performance Analysis</h3>
        </div>
        
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400 space-x-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing your performance...</span>
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
              <h4 className="flex items-center text-emerald-800 dark:text-emerald-400 font-bold mb-3 space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Strengths</span>
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-emerald-700 dark:text-emerald-500 text-sm flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-rose-50/50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/50">
              <h4 className="flex items-center text-rose-800 dark:text-rose-400 font-bold mb-3 space-x-2">
                <TrendingDown className="w-5 h-5" />
                <span>Areas to Review</span>
              </h4>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-rose-700 dark:text-rose-500 text-sm flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-amber-50/50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/50">
              <h4 className="flex items-center text-amber-800 dark:text-amber-400 font-bold mb-2 space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Recommendation</span>
              </h4>
              <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Detailed Review */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 px-2">Detailed Review</h3>
        {finalResults.map((result, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border transition-colors ${result.grading.isCorrect ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {result.grading.isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-500" />}
              </div>
              <div className="flex-grow space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Question {idx + 1}</span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{result.question.chapter}</span>
                  </div>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-50">{result.question.questionVariations[0]}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Your Answer</span>
                    <p className={result.grading.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>{result.userAnswer}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Correct Answer</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{result.question.correctAnswer}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">AI Feedback</span>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{result.grading.feedback}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
