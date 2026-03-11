import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Question, QuizConfig, UserAnswer, GradingResult } from '../types';
import { gradeAnswer } from '../lib/gemini';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ShrinkToFit({ children, dependencies }: { children: React.ReactNode, dependencies: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const checkFit = () => {
      if (!containerRef.current || !contentRef.current) return;
      
      const container = containerRef.current;
      const content = contentRef.current;
      
      content.style.transform = 'none';
      
      const containerHeight = container.clientHeight;
      const contentHeight = content.scrollHeight;
      
      if (contentHeight > containerHeight) {
        const newScale = containerHeight / contentHeight;
        setScale(Math.max(0.4, newScale - 0.02)); 
      } else {
        setScale(1);
      }
    };

    const timeoutId = setTimeout(checkFit, 10);
    window.addEventListener('resize', checkFit);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkFit);
    };
  }, dependencies);

  return (
    <div className="flex-grow relative overflow-hidden w-full" ref={containerRef}>
      <div 
        ref={contentRef} 
        className="absolute top-0 left-0 w-full origin-top transition-transform duration-200" 
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

interface QuizScreenProps {
  questions: Question[];
  config: QuizConfig;
  onComplete: (results: UserAnswer[]) => void;
  isStudyMode?: boolean;
}

export function QuizScreen({ questions, config, onComplete, isStudyMode = false }: QuizScreenProps) {
  // In study mode, we keep a queue of questions. Wrong answers go to the back.
  const [queue, setQueue] = useState<Question[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0); // Index in the original questions array for progress
  
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [currentGrading, setCurrentGrading] = useState<GradingResult | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const question = queue[0];

  // Req 6: Dynamically pick a variation of the question to avoid rote memorization
  const currentQuestionText = useMemo(() => {
    if (!question) return '';
    const variations = question.questionVariations;
    return variations[Math.floor(Math.random() * variations.length)];
  }, [question]);

  // Timer logic
  useEffect(() => {
    if (isFlipped || config.timeLimit === 0 || !question) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFlipped, config.timeLimit, question]);

  const handleTimeUp = async () => {
    setIsGrading(true);
    try {
      // Auto-grade as wrong if time is up
      const formatToUse = question.format || (Array.isArray(config.format) ? config.format[0] : config.format);
      const grading = await gradeAnswer(question, "No answer provided (Time's up)", formatToUse);
      setCurrentGrading({ ...grading, isCorrect: false, feedback: "Time ran out before you could answer. " + grading.feedback });
      setIsFlipped(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentInput.trim() && timeLeft > 0) return;

    setIsGrading(true);
    try {
      const formatToUse = question.format || (Array.isArray(config.format) ? config.format[0] : config.format);
      const grading = await gradeAnswer(question, currentInput, formatToUse);
      setCurrentGrading(grading);
      setIsFlipped(true);
    } catch (error) {
      console.error("Failed to grade:", error);
      alert("Failed to grade answer. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  const handleNext = () => {
    if (!currentGrading) return;

    const newAnswers = [...userAnswers, { question, userAnswer: currentInput, grading: currentGrading, timeSpent }];
    setUserAnswers(newAnswers);
    
    let nextQueue = [...queue.slice(1)];
    
    // Study Mode Logic: If wrong, push to the back of the queue
    if (isStudyMode && !currentGrading.isCorrect) {
      nextQueue.push(question);
    }

    if (nextQueue.length > 0) {
      setQueue(nextQueue);
      if (!isStudyMode || currentGrading.isCorrect) {
        setCurrentIndex(currentIndex + 1);
      }
      setCurrentInput('');
      setCurrentGrading(null);
      setIsFlipped(false);
      setTimeLeft(config.timeLimit);
      setTimeSpent(0);
    } else {
      onComplete(newAnswers);
    }
  };

  if (!question) return null;

  const progressPercent = isStudyMode 
    ? Math.round((currentIndex / (currentIndex + queue.length)) * 100)
    : Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-6">
        <div className="flex-grow pr-4">
          <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>{isStudyMode ? 'Study Mode' : `Question ${currentIndex + 1} of ${questions.length}`}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        {config.timeLimit > 0 && !isFlipped && (
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold ${timeLeft <= 10 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl">{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Flashcard Container */}
      <div className="relative perspective-1000 h-[70vh] min-h-[450px] max-h-[800px]">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col overflow-hidden transition-colors"
            >
              <div className="flex justify-between items-start mb-6 shrink-0">
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-full">
                  {question.format || (Array.isArray(config.format) ? config.format[0] : config.format)}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                  {question.chapter}
                </span>
              </div>
              
              <ShrinkToFit dependencies={[currentQuestionText, question.options, currentInput]}>
                <h3 className="text-2xl font-medium text-slate-900 dark:text-slate-50 leading-relaxed mb-8">
                  {currentQuestionText}
                </h3>

                <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
                  {(question.format === 'Multiple Choice' || (!question.format && config.format.includes('Multiple Choice'))) && question.options ? (
                    <div className="space-y-3">
                      {question.options.map((opt, i) => (
                        <label 
                          key={i} 
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            currentInput === opt 
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-600' 
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="mcq"
                            value={opt}
                            checked={currentInput === opt}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 focus:ring-indigo-600 bg-transparent shrink-0"
                          />
                          <span className="ml-3 text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-transparent rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none h-32 text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  )}
                </form>
              </ShrinkToFit>

              <div className="shrink-0 mt-4 pt-2 bg-white dark:bg-slate-900 z-10">
                <button
                  form="quiz-form"
                  type="submit"
                  disabled={(!currentInput.trim() && config.timeLimit === 0) || isGrading}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                >
                  {isGrading ? (
                    <>
                      <BrainCircuit className="w-5 h-5 animate-pulse" />
                      <span>AI is grading...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 rounded-3xl shadow-lg border p-8 flex flex-col overflow-hidden transition-colors ${
                currentGrading?.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center space-x-3">
                  {currentGrading?.isCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                  )}
                  <h3 className={`text-2xl font-bold ${currentGrading?.isCorrect ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                    {currentGrading?.isCorrect ? 'Correct!' : 'Not quite right'}
                  </h3>
                </div>
                {isStudyMode && !currentGrading?.isCorrect && (
                  <span className="flex items-center space-x-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    <span>Will review again</span>
                  </span>
                )}
              </div>

              <ShrinkToFit dependencies={[currentGrading]}>
                <div className="space-y-4 pb-4">
                  <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border border-white/40 dark:border-slate-700/40">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Your Answer</p>
                    <p className="text-slate-800 dark:text-slate-200">{currentInput || "(No answer)"}</p>
                  </div>

                  <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border border-white/40 dark:border-slate-700/40">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Correct Answer</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{question.correctAnswer}</p>
                  </div>

                  <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border border-white/40 dark:border-slate-700/40">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> AI Feedback
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentGrading?.feedback}</p>
                  </div>
                </div>
              </ShrinkToFit>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 shrink-0 z-10">
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors flex justify-center items-center space-x-2"
                >
                  <span>{queue.length > 1 ? 'Next Question' : 'See Results'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
