# IdeaForge - Hackathon Platform

IdeaForge is a complete, AI-agent first hackathon platform built to support the event lifecycle from registration to judging and results publication. 

## Local Deployment (DOGFOOD Evaluation)

This project strictly adheres to the DOGFOOD offline/local evaluation constraints. It requires zero cloud accounts, no external authentication-as-a-service, and no hosted databases.

### Prerequisites
- Docker & Docker Compose

### One-Command Startup
Open your terminal in the root of the project directory and run:

\\\ash
docker-compose up --build
\\\

This command will:
1. Spin up a local MongoDB container.
2. Build the Node.js/React application.
3. Automatically run database seeders to populate initial events, participants, and judges.
4. Generate the required \.dogfood.toml\ file for automated endpoint checking.

### Accessing the Platform
Once the container is running, open your browser and navigate to:
**[http://localhost:8080](http://localhost:8080)**

**How to log in (Dogfood Test Portal):**
We have bypassed standard email/password authentication to make evaluation seamless.
1. Click **Log In** on the top right.
2. You will see the **Dogfood Test Portal**.
3. Select any persona (Participant, Organizer, or Judge).
4. If logging in as a Judge, enter \judge@example.com\ when prompted.
5. You will be instantly logged in via a local, secure JWT session cookie!

## Project Structure
- \client/\: React 19 frontend (Tailwind CSS, Wouter).
- \server/\: Express/Node.js backend with tRPC.
- \shared/\: Shared types and validation logic.

## Demo Video
*(Link to 5-minute demo video goes here)*
