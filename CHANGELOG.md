# Quiz-Me! — Update Log

This file records notable changes committed to the repository. It describes code changes, not a guarantee that every feature is enabled in the live deployment.

## 2 November 2026

### Project Ascension and Supabase integration
- Added the Project Ascension progression hub to the dashboard.
- Added progression event recording for quiz completions and flashcard mastery.
- Added Supabase client support and backend endpoints for checking Supabase configuration and retrieving the SQL schema.
- Added real-time progression synchronisation hooks.
- Added a central Gemini service with model fallback and cooldown handling.
- Added a test command to the project scripts.

## 31 October 2026

### Examiner intelligence and learning workspaces
- Added AI-assisted written-answer evaluation.
- Added oral examination processing endpoints.
- Added question-quality auditing.
- Added Classroom Workspace and Syllabus Tracker modules.
- Added diagnostic and learning-dependency data structures.
- Expanded dashboard navigation for the new learning and assessment tools.

### Smart worksheet scanning
- Added Gemini-powered extraction of structured questions from uploaded worksheet images and documents.
- Added the worksheet scanning API endpoint.
- Added supporting backend database dependencies and application integration.

### Project documentation and security
- Added the project README with setup, architecture, security, and contribution guidance.
- Added a security policy describing responsible vulnerability reporting.

## 30 October 2026

### Authentication, schema and server improvements
- Updated the Firebase data schema and security rules.
- Improved administrative permission handling.
- Updated development server tooling.
- Improved live-session host validation.

## 10 October 2026

### Quiz and export improvements
- Added PowerPoint (PPTX) export support.
- Expanded AI generation capabilities and request limits.
- Updated the Gemini model hierarchy.
- Added initial exam and past-paper hub views.

## 4 October 2026

### Quiz system, mascot and platform improvements
- Improved quiz generation, caching, and answer sanitation.
- Added progression-related schema fields and Firestore rule updates.
- Added the mascot system and mascot-related rewards.
- Added mascot icons to the application branding.
- Added Music Studio and expanded achievement tracking.
- Improved dashboard navigation and AI performance.
- Added voice transcription and a suggestions hub.

---

## Notes
- Dates are based on repository commit timestamps.
- This log highlights selected feature and infrastructure commits; it is not an exhaustive list of every code change.
- Feature availability can depend on deployment configuration, environment variables, database setup, and connected services.
