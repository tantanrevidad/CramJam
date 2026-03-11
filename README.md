# CramJam

CramJam is an AI-powered study assistant that transforms your PDF notes into interactive, highly customizable flashcards and quizzes. Built with React and powered by Google's Gemini AI, CramJam helps you study smarter, not harder, by generating targeted questions, providing instant feedback, and analyzing your performance.

## Features

*   **PDF Upload:** Instantly process your study materials, lecture notes, or textbook chapters.
*   **Customizable Quizzes:** Choose your preferred question formats (Multiple Choice, Fill in the Blanks, True/False, etc.), difficulty level, and specific focus areas.
*   **Interactive Flashcards:** Engaging 3D flip animations and auto-scaling text ensure a seamless study experience across all devices.
*   **Smart Grading:** Fast-path grading for exact matches and multiple-choice questions, backed by AI evaluation for open-ended answers.
*   **AI Feedback & Analysis:** Get detailed explanations for every answer and a comprehensive breakdown of your strengths and weaknesses after each session.
*   **Deck Management:** Save your generated quizzes into custom decks and access them anytime from your personal dashboard.
*   **Dark Mode:** Built-in dark mode support for late-night cramming sessions.

## Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion (`motion/react`)
*   **Icons:** Lucide React
*   **AI Integration:** `@google/genai` (Gemini 3.1 Pro for generation, Gemini 3 Flash for grading/analysis)
*   **Storage:** LocalStorage for saving decks and user preferences

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up your environment variables (ensure `GEMINI_API_KEY` is available in your environment).
4.  Start the development server: `npm run dev`

## Usage

1.  **Upload:** Drag and drop a PDF file onto the upload screen.
2.  **Configure:** Select how many questions you want, the difficulty, and the formats. You can also specify a focus area (e.g., "Chapter 3").
3.  **Study:** Answer the questions on the interactive flashcards.
4.  **Review:** Check your AI performance analysis and save the deck for future review.
