# Architecture

IdeaForge follows a modern, decoupled monolithic architecture using a full-stack TypeScript ecosystem.

## Tech Stack
* **Frontend**: React, Wouter (routing), Tailwind CSS, Radix UI.
* **Backend**: Node.js, Express, tRPC for typesafe API endpoints.
* **Database**: MongoDB with Mongoose ORM.
* **Build System**: Vite (client), esbuild (server).

## System Design

1. **Client-Server Communication**
   The application uses tRPC for end-to-end typesafe API communication between the React frontend and the Express backend. This eliminates the need for manual API definitions or GraphQL schemas, and provides real-time autocomplete and validation.

2. **Authentication & Sessions**
   Authentication is managed via HTTP-only cookies (`IdeaForge-Session`) containing JWT tokens. The `sdk.ts` handles session creation and verification. Roles (Participant, Organizer, Judge, Admin) are persisted in the `User` document and checked via tRPC middleware and Express route guards.

3. **Data Persistence**
   MongoDB is used as the primary datastore. We chose a document-based database for flexibility with unstructured submission details and dynamic judging criteria. Mongoose provides schema validation and an auto-increment plugin is used to provide predictable, sequential integer IDs for all core entities (satisfying legacy or external integration requirements).

4. **Background & LLM Processing**
   The platform integrates with Google GenAI (`@google/genai`) for natural-language event discovery. The AI features are isolated in `server/_core/llm.ts` to prevent blocking the main Express thread.

5. **Deployment & Containerization**
   The system is packaged via Docker Compose, which brings up both the Node.js application (`ideaforge-app`) and the MongoDB instance (`ideaforge-mongo`).
