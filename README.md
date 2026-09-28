# IdeaForge - Hackathon Platform

IdeaForge is a complete, AI-agent first hackathon platform built to support the event lifecycle from registration to judging and results publication. 

## Setup & Running the Platform

To evaluate the platform, you can use the provided Docker Compose setup which starts a seeded portal.

### Prerequisites
- Docker & Docker Compose

### One-Command Startup
\`\`\`bash
docker compose up --build
\`\`\`

The portal will be available at `http://localhost:8080`.
The application automatically runs the seeder on startup, which populates the MongoDB database with fixtures (Tracks, Judges, Teams, Projects, and Scores) and generates the `.dogfood.toml` configuration with valid authentication tokens.

## Demo Video
*(Link to 5-minute demo video goes here)*

## Project Structure
- `client/`: React frontend.
- `server/`: Express/Node.js backend.
- `shared/`: Shared types and logic.
- `models.ts`: Mongoose database schemas.

## Testing
To run the automated tests:
\`\`\`bash
pnpm install
pnpm test
\`\`\`
