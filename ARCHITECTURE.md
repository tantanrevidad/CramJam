# Architecture

CramJam is a client-side Single Page Application (SPA) built with React and Vite. It relies heavily on the Google Gemini API for its core functionality, operating without a traditional custom backend database (user data is stored locally).

## High-Level Flow

1.  **Document Processing:** The user uploads a PDF. The file is converted to a base64 string and passed directly to the Gemini API as an inline document part.
2.  **Quiz Generation:** The app sends a structured prompt to `gemini-3.1-pro-preview` along with the document. The prompt enforces a strict JSON schema to return an array of `Question` objects, including multiple variations of the question to prevent rote memorization.
3.  **Interactive Session:** The React UI presents the questions one by one using Framer Motion for flashcard animations. A custom `ShrinkToFit` component ensures long text fits within the card bounds.
4.  **Grading Engine:** 
    *   **Fast-Path:** Exact text matches and incorrect multiple-choice selections are graded instantly on the client side to reduce latency.
    *   **AI Grading:** Open-ended answers are sent to `gemini-3-flash-preview` to evaluate semantic correctness, handle typos, and provide personalized feedback.
5.  **Analysis & Storage:** After the quiz, `gemini-3-flash-preview` analyzes the results to identify strengths and weaknesses. The user can then save the deck to the browser's `localStorage`.

## Component Structure

*   `App.tsx`: The main orchestrator. Manages the global state (`appState`: dashboard, upload, config, quiz, results) and holds the loaded PDF, current config, and saved decks.
*   `UploadScreen.tsx`: Handles drag-and-drop PDF file selection.
*   `ConfigScreen.tsx`: Form for setting quiz parameters (difficulty, format, count, focus area).
*   `QuizScreen.tsx`: The core interactive component. Manages the queue of questions, user input, flashcard flip state, and calls the grading logic.
*   `ResultScreen.tsx`: Displays the final score, AI analysis, and provides options to save the deck or restart.
*   `Dashboard.tsx`: Lists saved decks loaded from `localStorage` and allows the user to initiate study mode.

## AI Integration (`src/lib/gemini.ts`)

The application uses the `@google/genai` SDK.
*   **`generateQuiz`**: Uses `gemini-3.1-pro-preview` with `responseSchema` to guarantee structured JSON output for questions.
*   **`gradeAnswer`**: Uses `gemini-3-flash-preview` for low-latency evaluation of user answers.
*   **`analyzeResults`**: Uses `gemini-3-flash-preview` to summarize performance across a batch of answers.

## State Management

State is managed primarily via React's `useState` and `useEffect` hooks at the `App.tsx` level, passing data down as props. Persistent state (saved decks) is synced with the browser's `localStorage`.
