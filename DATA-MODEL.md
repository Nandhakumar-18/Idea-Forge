# Data Model

The IdeaForge data model is implemented using MongoDB and Mongoose. All models use an auto-increment plugin to provide a sequential integer `id` alongside the default Mongo `_id`.

## Core Entities

* **User**: Represents all platform accounts. Roles include `user`, `student`, `organizer`, `judge`, and `admin`. Uses `openId` for external identity linkage.
* **StudentProfile**: Extended profile data for student participants (skills, graduation year, program) for eligibility checking.
* **Event**: Represents a hackathon. Contains fields for team constraints, deadlines, format (online/hybrid), and configuration toggles (resultsLocked).
* **Team & TeamMember**: Manages team formation and invite codes.
* **Submission**: Represents a project submitted by a Team. Supports multiple versions and draft states.
* **JudgeAssignment & Evaluation**: Maps a Judge (User) to a Submission. Tracks conflicts of interest and feedback/scores.
* **Certificate**: Tracks generated certificates for achievements.

## Dogfood (Hackathon Checker) Entities
To specifically support the evaluation suite, we maintain explicit tables for the test fixtures:
* **DogfoodTrack**: Event tracks/categories.
* **DogfoodJudge**: Judge profiles and assigned tracks.
* **DogfoodTeam & DogfoodProject**: Teams and their submitted projects (with title, summary, repo_url).
* **DogfoodScore**: Individual judge evaluations of a project across multiple criteria.

## Import/Export Paths
Data can be exported via the `/api/dogfood/export.csv` endpoint, which generates a combined CSV of all projects and judging scores for external auditing. The seeder (`server/seeder.ts`) handles importing data from `fixtures.json` on startup.
