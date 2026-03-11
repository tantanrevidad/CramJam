# CramJam Roadmap

This document outlines the current state of CramJam and the planned features for future releases.

## Phase 1: Core MVP (Current State)
- [x] PDF Upload and parsing
- [x] Customizable quiz generation (format, difficulty, count)
- [x] Interactive 3D flashcard UI
- [x] Auto-scaling text for long questions/answers
- [x] Hybrid grading system (Fast-path + AI semantic grading)
- [x] Post-quiz AI performance analysis
- [x] Local storage for saving and reviewing decks
- [x] Dark mode support

## Phase 2: Enhanced Learning & Retention (Short-Term)
- [ ] **Spaced Repetition System (SRS):** Implement an algorithm (like SM-2) to schedule reviews for saved decks based on user performance.
- [ ] **Multi-File Support:** Allow users to upload multiple PDFs or mix text/PDF inputs for a single comprehensive quiz.
- [ ] **Export Options:** Allow users to export decks to CSV, Anki, or Quizlet formats.
- [ ] **Image/Diagram Extraction:** Better handling of visual elements in PDFs, allowing the AI to crop and display specific diagrams on the flashcards.

## Phase 3: Cloud & Collaboration (Mid-Term)
- [ ] **User Authentication:** Integrate Firebase or Supabase for user accounts.
- [ ] **Cloud Sync:** Move away from `localStorage` to cloud databases so users can access their decks across devices.
- [ ] **Deck Sharing:** Generate shareable links for decks so classmates can study together.
- [ ] **Leaderboards & Gamification:** Add streaks, badges, and study stats to keep users motivated.

## Phase 4: Advanced AI Features (Long-Term)
- [ ] **Audio/Voice Mode:** Use Gemini's native audio capabilities to allow users to answer questions verbally and receive spoken feedback.
- [ ] **Real-time Tutor Chat:** Add a chat interface alongside the flashcards where users can ask the AI follow-up questions about a specific concept they got wrong.
- [ ] **Automatic Note Generation:** Reverse the process—generate structured study guides and summaries from the quizzes and uploaded materials.
