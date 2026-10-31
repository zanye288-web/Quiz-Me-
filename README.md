# Quiz-Me!

**Quiz-Me!** is an AI-powered learning and examination-preparation platform built to help students create assessments, practise, understand difficult topics, and track their learning progress.

The project combines quiz creation, AI-assisted learning tools, revision resources, and exam-focused workflows in one application.

> This repository is actively evolving. Features and setup details may change as development continues.

## What it includes

The current application codebase includes the following areas:

- **Quiz and assessment studio** — create and customise quizzes and assessments.
- **AI-powered learning** — an AI tutor and AI-assisted educational content generation.
- **Notes and revision** — an Intelligent Notes Hub, flashcards, mnemonics, and revision resources.
- **Exam preparation** — past-paper and exam-oriented workflows, exam simulations, and study tools.
- **Learning insights** — performance analytics and diagnostic mastery tools.
- **STEM and humanities tools** — subject-focused learning experiences and a mathematics sandbox.
- **Community and collaboration** — community features and live learning sessions.
- **Worksheet scanning** — AI-assisted extraction of structured questions from uploaded images and documents.
- **Export and productivity tools** — printable worksheets, PDF/PPTX-related workflows, study timers, and other utilities.

Availability of individual features may depend on configuration, connected services, and the current deployment.

## Technology

The project currently uses:

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Express
- Google Gemini through the `@google/genai` SDK
- Firebase client and Admin SDKs
- Drizzle ORM and PostgreSQL tooling
- Lucide icons and Motion

## Getting started

### Prerequisites

- Node.js with npm
- A Google Gemini API key for AI-powered features
- Firebase configuration and services for features that use Firebase
- PostgreSQL configuration only if you are running database functionality that requires it

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` and provide the values required by your local environment.

At minimum, AI-powered features need:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Keep real credentials in local environment files or your deployment provider's secret manager. Never commit API keys, service-account JSON, database passwords, or other secrets.

Firebase and any optional database services must also be configured with the credentials and settings required by the relevant parts of the application. Do not use production credentials for local testing.

### Connect a Supabase (PostgreSQL) database

The server's relational features (profiles, quizzes, history, leaderboard) use PostgreSQL through Drizzle ORM. Supabase works as a hosted PostgreSQL database; Firebase Authentication and Firestore are unchanged.

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database → Connection string**, copy the **Session pooler** string (host `aws-0-<region>.pooler.supabase.com`, user `postgres.<project-ref>`). Prefer it over the direct connection, which is IPv6-only on many plans.
3. Add these to your `.env` (and your host's secret manager):

   ```env
   DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
   SQL_SSL="true"
   ```

   Alternatively, set `SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME` (plus `SQL_ADMIN_USER` and `SQL_ADMIN_PASSWORD` for migrations). See `.env.example`.
4. Create the tables from the Drizzle schema:

   ```bash
   npx drizzle-kit push --config src/db/drizzle.config.ts
   ```

   Run this against the Session pooler or direct connection, not the Transaction pooler (port 6543).
5. Lock the tables down. Supabase exposes `public` tables through its REST API, and tables created by Drizzle have row-level security off. The app only reaches the database through the Express server, so enable RLS with no policies by running this in the Supabase SQL editor:

   ```sql
   alter table users enable row level security;
   alter table quizzes enable row level security;
   alter table quiz_history enable row level security;
   alter table quiz_likes enable row level security;
   alter table quiz_saves enable row level security;
   alter table quiz_comments enable row level security;
   alter table favorites enable row level security;
   alter table followed_creators enable row level security;
   ```

   The server connects as the Postgres role, which bypasses RLS, so the app keeps working.

### Run locally

```bash
npm run dev
```

The development server is configured to use port `3000` by default.

### Build for production

```bash
npm run build
npm start
```

### Type-check

```bash
npm run lint
```

## Environment and deployment notes

- The Express entry point is `server.ts`; API routes are mounted under `/api`.
- The production build creates the frontend bundle and bundles the server entry point.
- Configure secrets in the hosting platform rather than embedding them in source code.
- Configure Firebase Authentication, Firestore rules, and any required backend services before enabling their related features in a deployment.
- Review the deployment platform's requirements for Node.js, environment variables, networking, and persistent services.

## Security

Please read [SECURITY.md](./SECURITY.md) for the project's vulnerability-reporting process and security expectations.

Do not post credentials, private user data, or exploitable vulnerability details in public issues.

## Contributing

Contributions, bug reports, and thoughtful suggestions are welcome.

1. Check existing issues before opening a new one.
2. For ordinary bugs or feature suggestions, open a GitHub issue with clear reproduction steps or an explanation of the proposed improvement.
3. For code changes, create a focused branch and submit a pull request.
4. Include relevant tests and update documentation when behaviour or setup changes.
5. Never include secrets, private user information, or copyrighted educational materials that you do not have permission to distribute.

## Educational content and AI

AI-generated explanations, questions, summaries, and extracted worksheet content can contain errors. Students should be able to review generated material, and important academic information should be checked against reliable sources and official examination materials.

Quiz-Me! should not be treated as an official examination board or a replacement for teachers and authoritative learning resources.

## License

No open-source license is currently specified in this repository. Unless a license is added, the project remains subject to the default copyright rules; do not assume that the code or assets may be reused, modified, or redistributed.
