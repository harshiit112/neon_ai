# neon.ai

> Turn a rough idea, set of notes, or product brief into a polished presentation.

neon.ai is a full-stack AI presentation studio built with TanStack Start. Users sign in, describe what they want to present, choose a visual style, tone, layout, and slide count, then receive an editable presentation with generated slide content and visual prompts.

## Product Workflow

The application separates presentation creation from AI generation so the user reaches the presentation workspace immediately while the longer-running generation job continues in the background.

```mermaid
flowchart LR
    A[Sign in] --> B[Enter prompt and options]
    B --> C[Create presentation record]
    C --> D[Redirect to /presentations/id]
    D --> E[Dispatch Inngest event]
    E --> F[Generate structured slides with Gemini]
    F --> G[Create slide records in PostgreSQL]
    G --> H[Mark presentation completed]
    H --> I[Refresh workspace]
```

### Create and generate flow

1. The user authenticates with Better Auth and a social provider.
2. The home route validates the prompt and presentation options.
3. A TanStack Start server function creates a `Presentation` row with `GENERATING` status.
4. The client redirects to `/presentations/:presentationId` using the returned ID.
5. The presentation detail hook dispatches the `presentation/generate` Inngest event.
6. Inngest loads the presentation, asks Gemini for structured slide data, and writes the slides to PostgreSQL.
7. The detail page polls while the status is `GENERATING` and displays the completed deck when the worker finishes.

### Presentation workspace

The detail page supports:

- Live generation status.
- Slide-by-slide preview and navigation.
- Editing the title, prompt, slide count, style, tone, and layout.
- Regenerating slides.
- Deleting a presentation.
- Full-screen preview and slideshow mode.
- PPTX export.

## Technology Stack

| Area             | Technology                                     | Role                                                    |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Application      | TanStack Start                                 | SSR, server functions, API routes, and Vite integration |
| UI               | React 19                                       | Component-based interface                               |
| Routing          | TanStack Router                                | File-based typed routes and navigation                  |
| Data fetching    | TanStack Query                                 | Server state, caching, invalidation, and polling        |
| Styling          | Tailwind CSS 4                                 | Utility styling and responsive layouts                  |
| Components       | Base UI, Lucide React, Shadcn-style primitives | Accessible controls and interaction patterns            |
| Authentication   | Better Auth                                    | Sessions, cookies, Google OAuth, and GitHub OAuth       |
| Database         | PostgreSQL on Neon                             | Users, sessions, presentations, and slides              |
| ORM              | Prisma 7 with `@prisma/adapter-pg`             | Schema, migrations, and typed database access           |
| AI               | Vercel AI SDK and Google Gemini                | Structured slide generation                             |
| Background jobs  | Inngest                                        | Durable asynchronous presentation generation            |
| Media            | ImageKit                                       | Image URLs for slide visuals and thumbnails             |
| Build and deploy | Vite, Nitro, Vercel                            | Production build and serverless deployment              |

## Repository Structure

```text
src/
  components/             Shared application and UI components
  features/presentation/  Presentation actions, components, hooks, and types
  integrations/           Better Auth, Inngest, and TanStack Query integrations
  lib/                    Database, authentication, ImageKit, and utilities
  middleware/             Request and server-function authentication middleware
  routes/                 File-based pages and API routes
  router.tsx              TanStack Router and SSR Query setup
  styles.css              Global styles and Tailwind entrypoint

prisma/
  schema.prisma           PostgreSQL data model
  migrations/             Versioned database migrations

vite.config.ts            Vite, TanStack Start, Nitro, React, and Tailwind plugins
vercel.json               Vercel framework configuration
prisma.config.ts          Prisma schema and migration configuration
tsconfig.json             Strict TypeScript configuration
package.json              Scripts and dependencies
```

## Requirements

- Node.js 20 or newer.
- npm.
- A PostgreSQL database, preferably Neon for this project.
- A Google Gemini API key.
- An Inngest account for production, or the Inngest Dev Server locally.
- An ImageKit account for generated visual URLs.
- OAuth credentials for Google and/or GitHub.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the project root. Never commit this file.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"

BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_BASE_URL="https://ik.imagekit.io/your-imagekit-id"

INNGEST_DEV=1
INNGEST_DEVSERVER_URL="http://localhost:8288"
```

Use the exact model configured in `src/integrations/inngest/function.ts`. The AI provider and model can change over time, so confirm the selected Gemini model is available for your API account.

### 3. Apply database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

For local schema development, use `npx prisma migrate dev` instead of manually editing the database.

### 4. Start Inngest locally

Run the Inngest Dev Server in a separate terminal:

```bash
npx inngest-cli@latest dev
```

The local dashboard is available at `http://localhost:8288`. The application exposes its Inngest endpoint at:

```text
http://localhost:3000/api/inngest
```

### 5. Start the application

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Commands

| Command                     | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `npm run dev`               | Start the Vite/TanStack Start development server on port 3000 |
| `npm run build`             | Build the client, SSR bundle, and Nitro output                |
| `npm run preview`           | Preview the production build locally                          |
| `npm run generate-routes`   | Regenerate the TanStack Router route tree                     |
| `npm run lint`              | Run ESLint                                                    |
| `npm run check`             | Check Prettier formatting                                     |
| `npm run format`            | Format files and apply ESLint fixes                           |
| `npx prisma migrate deploy` | Apply committed migrations                                    |
| `npx prisma generate`       | Regenerate the typed Prisma client                            |
| `npx prisma studio`         | Open Prisma Studio                                            |

## Authentication

Better Auth stores users, sessions, accounts, and verification records in PostgreSQL through the Prisma adapter.

The application uses:

- `src/lib/auth.ts` for server-side Better Auth configuration.
- `src/lib/auth-client.ts` for the browser client.
- `src/lib/auth.functions.ts` for server-side session access.
- `src/middleware/auth.ts` for protected route and server-function guards.
- `src/routes/api/auth/$.ts` for the Better Auth API handler.

### Google OAuth callback URLs

For local development:

```text
Authorized JavaScript origin:
http://localhost:3000

Authorized redirect URI:
http://localhost:3000/api/auth/callback/google
```

For Vercel, replace the host with the deployed domain:

```text
https://your-app.vercel.app/api/auth/callback/google
```

The Google OAuth consent screen must also include your account as a test user while the app is in testing mode.

## Database Model

The main domain entities are:

- `User`: authenticated application user.
- `Session`: Better Auth session data.
- `Account`: OAuth provider account linkage.
- `Verification`: Better Auth verification data.
- `Presentation`: prompt, configuration, owner, status, and timestamps.
- `Slide`: generated content belonging to a presentation.

Presentation statuses are:

```text
DRAFT       Initial editable state
GENERATING  Background AI generation is running
COMPLETED   Slides were generated successfully
FAILED      Generation or event delivery failed
```

The `slideCount` field stores the requested number of slides and defaults to `8` for older records.

## Server Functions and API Routes

The application uses TanStack Start server functions for typed server-side operations:

### Presentation functions

Located in `src/features/presentation/actions/`:

- Create a presentation.
- Start background generation.
- Read a presentation with its slides.
- List the current user's presentations.
- Update presentation settings.
- Regenerate slides.
- Delete a presentation.

### API routes

| Route          | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `/api/auth/*`  | Better Auth API and OAuth callbacks              |
| `/api/inngest` | Inngest function registration and event delivery |

## AI Generation Pipeline

The Inngest function in `src/integrations/inngest/function.ts` performs the following steps:

1. Fetch the presentation from PostgreSQL.
2. Mark the record as `GENERATING`.
3. Send the prompt and presentation preferences to Google Gemini.
4. Validate the structured response with Zod.
5. Delete previous slides when regenerating.
6. Create the new slide records.
7. Build ImageKit visual URLs for each slide.
8. Mark the presentation as `COMPLETED`.

If a step fails, inspect the Inngest run and server logs. Common causes include an unavailable Gemini model, an invalid API key, exhausted provider quota, or a missing ImageKit base URL.

## Vercel Deployment

### 1. Push the repository

```bash
git add .
git commit -m "Prepare neon.ai for deployment"
git push origin main
```

Do not commit `.env` or any secret values.

### 2. Import the project into Vercel

1. Open Vercel and select **Add New > Project**.
2. Import the GitHub repository.
3. Keep the TanStack Start framework detection.
4. Use `npm run build` as the build command if Vercel does not detect it automatically.
5. Leave the output directory empty; Nitro manages the deployment output.

### 3. Add production environment variables

Add the production equivalents of the local variables in Vercel project settings:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_GENERATIVE_AI_API_KEY
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_BASE_URL
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
```

Do not set `INNGEST_DEV=1` in production.

### 4. Configure Inngest production delivery

Register this deployed endpoint with Inngest:

```text
https://your-domain.vercel.app/api/inngest
```

The local Inngest Dev Server is not used by Vercel. Production generation requires the Inngest cloud environment and its event/signing keys.

### 5. Apply production migrations

Before or during the first production deployment, point `DATABASE_URL` at the production Neon branch and run:

```bash
npx prisma migrate deploy
npx prisma generate
```

Never use `prisma migrate reset` against production data.

### 6. Deploy and verify

After deployment:

1. Open the production URL.
2. Sign in with an OAuth provider.
3. Create a presentation.
4. Confirm the browser navigates to `/presentations/<id>`.
5. Confirm the status moves from `GENERATING` to `COMPLETED`.
6. Check Vercel function logs and Inngest run logs if a job fails.

## Troubleshooting

### The Generate button does not navigate

Check the browser Network panel for the create server-function request. A successful request must return a presentation ID. Then inspect the destination request and the server logs.

Common causes:

- Database migration is missing `slideCount`.
- The user session is expired.
- `DATABASE_URL` points to an unavailable database.
- A stale Vite process is serving old generated Prisma code.

Restart after schema or environment changes:

```bash
npm run dev
```

### The presentation stays in `GENERATING`

Check:

- Inngest Dev Server or production Inngest is running.
- `/api/inngest` is registered successfully.
- `GOOGLE_GENERATIVE_AI_API_KEY` is valid.
- The Gemini model configured in the worker is available to your account.
- ImageKit variables are present.

### OAuth fails

Check:

- `BETTER_AUTH_URL` matches the current host.
- Google/GitHub callback URLs exactly match the current domain.
- OAuth client secrets are present in the same Vercel environment as the deployment.
- The OAuth app includes your account as a test user when applicable.

### Database connection errors

Use a Neon connection string with explicit SSL verification:

```text
?sslmode=verify-full
```

Then verify connectivity and migrations:

```bash
npx prisma migrate status
npx prisma migrate deploy
```

## Security Notes

- Never commit `.env` files or secret values.
- Keep OAuth client secrets, database URLs, AI keys, ImageKit private keys, and Inngest signing keys server-only.
- Do not prefix secrets with `VITE_`.
- Rotate any credential that has been exposed in logs, screenshots, commits, or chat.
- Use separate Neon branches and credentials for development, preview, and production.
- Use a strong, unique `BETTER_AUTH_SECRET` in every environment.

## License

No license has been declared for this project yet.
