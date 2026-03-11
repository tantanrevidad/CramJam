import React, { useState } from 'react';
import { QuizConfig, QuestionFormat, Difficulty, DiagramQuizType } from '../types';
import { Settings, BookOpen, Target, Hash, Clock, Image as ImageIcon, Search, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

interface ConfigScreenProps {
  onStart: (config: QuizConfig) => void;
  isGenerating: boolean;
}

const FORMATS: QuestionFormat[] = ['Multiple Choice', 'Matching Type', 'Modified True or False', 'Fill in the Blanks', 'Identification', 'Enumeration'];
const DIFFICULTIES: { level: Difficulty; desc: string }[] = [
  { level: 'Easy', desc: 'Basic conceptual questions directly from the material.' },
  { level: 'Medium', desc: 'Mix of recall and understanding.' },
  { level: 'Hard', desc: 'Situational, practical questions applying concepts.' }
];
const DIAGRAM_TYPES: DiagramQuizType[] = ['None', 'Explain the process', 'Fill in the blanks'];

export function ConfigScreen({ onStart, isGenerating }: ConfigScreenProps) {
  const [format, setFormat] = useState<QuestionFormat[]>(['Multiple Choice']);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [count, setCount] = useState<number>(5);
  const [focusArea, setFocusArea] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [diagramQuizType, setDiagramQuizType] = useState<DiagramQuizType>('None');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ format, difficulty, count, focusArea, timeLimit, diagramQuizType });
  };

  if (isGenerating) {
    return (
      <div className="w-full max-w-3xl mx-auto p-12 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-8"
        >
          <BrainCircuit className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Generating Your Quiz...</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
          Our AI is reading your notes, extracting key concepts, and crafting the perfect flashcards for you. This usually takes 10-20 seconds.
        </p>
        <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Configure Your Quiz</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Focus Area */}
        <div className="space-y-4">
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>Focus Area (Optional)</span>
          </label>
          <input
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g., Chapter 3, Pages 10-15, or leave blank for entire material"
            className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-transparent rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-700 dark:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Format Selection */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Question Formats (Select multiple)</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {FORMATS.map((f) => {
                const isSelected = format.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      if (isSelected && format.length > 1) {
                        setFormat(format.filter(item => item !== f));
                      } else if (!isSelected) {
                        setFormat([...format, f]);
                      }
                    }}
                    className={`p-3 text-left rounded-xl border transition-all text-sm ${
                      isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600 font-medium' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span>{f}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Others */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Difficulty Level</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.level}
                    type="button"
                    onClick={() => setDifficulty(d.level)}
                    className={`p-3 text-left rounded-xl border transition-all flex flex-col ${
                      difficulty === d.level ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-sm mb-0.5">{d.level}</span>
                    <span className={`text-xs ${difficulty === d.level ? 'text-indigo-600/80 dark:text-indigo-400/80' : 'text-slate-500 dark:text-slate-400'}`}>{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagram Options */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" />
                <span>Diagrams & Images</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DIAGRAM_TYPES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiagramQuizType(d)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      diagramQuizType === d ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Question Count */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Hash className="w-4 h-4" />
              <span>Number of Questions</span>
            </label>
            <div className="flex items-center space-x-4">
              <input type="range" min="1" max="30" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-50 w-12 text-center">{count}</span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Time Limit (per question)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input type="range" min="0" max="120" step="5" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-50 w-20 text-center">
                {timeLimit === 0 ? 'None' : `${timeLimit}s`}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" disabled={isGenerating} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            <span>Generate Flashcards</span>
          </button>
        </div>
      </form>
    </div>
  );
}
