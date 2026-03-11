import { GoogleGenAI, Type } from '@google/genai';
import { Question, QuizConfig, GradingResult, UserAnswer, QuizAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

export async function generateQuiz(file: File, config: QuizConfig): Promise<Question[]> {
  const documentPart = await fileToGenerativePart(file);

  const difficultyPrompt = {
    Easy: "Focus on basic conceptualized questions directly from the material. Straightforward recall.",
    Medium: "Focus on a mix of recall and understanding, requiring the user to connect some concepts.",
    Hard: "Focus on situational, practical questions applying the concepts from the material. Require deep reasoning."
  }[config.difficulty];

  const focusPrompt = config.focusArea.trim() 
    ? `FOCUS AREA: Restrict your questions strictly to the following topic/chapter/pages: "${config.focusArea}". Ignore other parts of the document.` 
    : `FOCUS AREA: Cover the entire material comprehensively.`;

  const diagramPrompt = config.diagramQuizType !== 'None'
    ? `DIAGRAMS/IMAGES: The user wants to be quizzed on diagrams or images in the text. Format for diagram questions: ${config.diagramQuizType}. If you see a diagram, describe it or refer to its title, and ask the question based on that.`
    : `DIAGRAMS/IMAGES: Do not focus on diagrams or images.`;

  const prompt = `
    You are an expert tutor and exam creator. I have provided a document containing study notes.
    Please generate exactly ${config.count} questions based on the document.
    
    ${focusPrompt}
    
    Format of questions: ${config.format.join(', ')}
    Difficulty level: ${config.difficulty} (${difficultyPrompt})
    ${diagramPrompt}
    
    Instructions for specific formats:
    - Multiple Choice: Provide 4 options.
    - Matching Type: Present the question as a list of items to match (e.g., "Match the following: 1. X, 2. Y to A. Z, B. W").
    - Modified True or False: If false, the correct answer should indicate what word needs to be changed.
    - Enumeration: Ask the user to list items.
    
    CRITICAL: For EACH question, you MUST provide an array of 3 'questionVariations'. These should be 3 slightly different ways of phrasing the EXACT SAME question. This is to prevent the user from learning via rote memorization of the sentence structure.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      { role: 'user', parts: [documentPart, { text: prompt }] }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique random UUID for this question" },
            chapter: { type: Type.STRING, description: "The chapter or main topic area this question belongs to (e.g., 'Chapter 1: Cell Biology')" },
            format: { type: Type.STRING, description: "The specific format chosen for this question from the requested formats." },
            questionVariations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly 3 slightly different ways to phrase this question."
            },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Provide 4 options if the format is Multiple Choice. Otherwise, leave empty."
            },
            correctAnswer: { type: Type.STRING, description: "The exact correct answer" },
            explanation: { type: Type.STRING, description: "A detailed explanation of why this is the correct answer." }
          },
          required: ["id", "chapter", "format", "questionVariations", "correctAnswer", "explanation"]
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate quiz content.");
  const questions = JSON.parse(response.text) as Question[];

  // Shuffle options for Multiple Choice questions so the correct answer isn't always first
  questions.forEach(q => {
    if (q.options && q.options.length > 0) {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    }
  });

  return questions;
}

export async function gradeAnswer(question: Question, userAnswer: string, format: string): Promise<GradingResult> {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = question.correctAnswer.trim().toLowerCase();

  // Fast path 1: Exact match
  if (normalizedUser === normalizedCorrect) {
    return {
      isCorrect: true,
      score: 1,
      feedback: `Perfect! ${question.explanation}`
    };
  }

  // Fast path 2: Time's up
  if (userAnswer === "No answer provided (Time's up)") {
    return {
      isCorrect: false,
      score: 0,
      feedback: `Time ran out. The correct answer is ${question.correctAnswer}. ${question.explanation}`
    };
  }

  // Fast path 3: Multiple Choice (Wrong Option Selected)
  // If the format is MCQ, and the correct answer exactly matches one of the options,
  // and the user selected an option that is NOT the correct answer.
  if (
    format === 'Multiple Choice' && 
    question.options && 
    question.options.includes(userAnswer) &&
    question.options.includes(question.correctAnswer)
  ) {
    return {
      isCorrect: false,
      score: 0,
      feedback: `Incorrect. The correct answer is ${question.correctAnswer}. ${question.explanation}`
    };
  }

  const prompt = `
    You are an expert tutor grading a student's answer.
    
    Question Format: ${format}
    Question (One variation): ${question.questionVariations[0]}
    Correct Answer: ${question.correctAnswer}
    Student's Answer: ${userAnswer}
    
    Evaluate the student's answer. 
    - Is it correct? (Consider synonyms, slight misspellings, or correct concepts even if phrased differently).
    - Give a score from 0 to 1.
    - Provide brief, encouraging feedback explaining why it is correct or incorrect. Include the actual explanation: ${question.explanation}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["isCorrect", "score", "feedback"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to grade answer.");
  return JSON.parse(response.text) as GradingResult;
}

export async function analyzeResults(results: UserAnswer[]): Promise<QuizAnalysis> {
  const prompt = `
    Analyze the following quiz results for a student.
    
    Results:
    ${JSON.stringify(results.map(r => ({
      chapter: r.question.chapter,
      question: r.question.questionVariations[0],
      isCorrect: r.grading.isCorrect,
      timeSpentSeconds: r.timeSpent
    })))}
    
    Identify 2-3 strengths (topics or question types they did well on, or fast correct answers).
    Identify 2-3 weaknesses (topics they struggled with, or took too long on).
    Provide 1 overall recommendation for their next study session.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ["strengths", "weaknesses", "recommendation"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to analyze results.");
  return JSON.parse(response.text) as QuizAnalysis;
}
