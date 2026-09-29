# 🛠️ IdeaForge - Build What Matters

![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248.svg?style=for-the-badge&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF.svg?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-Dark_Mode-38B2AC.svg?style=for-the-badge&logo=tailwind-css)

**IdeaForge** is a next-generation hackathon and innovation platform. We eliminate the friction of organizing events, finding the right teammates, and evaluating projects, replacing clunky spreadsheets with an all-in-one ecosystem.

---

## ✨ Features

### 👨‍💻 For Builders (Participants)
- **Unified Identity:** A single portfolio tracking past participation, achievements, and immutable certificates.
- **AI-Powered Discovery:** Converse with the IdeaForge AI to instantly find hackathons that match your specific tech stack, region, and team size.
- **Seamless Teambuilding:** One-click registration, instant team creation, and secure invite codes.

### 🏢 For Organizers
- **Event Studio:** Create and publish events, define format (online/hybrid), and set strict eligibility constraints (e.g., student-only, graduation year).
- **Automated Compliance:** Registration workflows automatically block users who don't meet your strict event criteria.
- **Judge Management:** Invite judges via email and issue digital certificates to winners upon event completion.

### ⚖️ For Judges
- **Focused Evaluation Portal:** A dedicated, distraction-free UI to review assigned submissions.
- **Conflict of Interest Protection:** Built-in tools to declare conflicts before scoring.
- **AI-Assisted Summaries:** Optional AI workflows to summarize repositories and evaluate requirements quickly.

---

## 🚀 Local Deployment (DOGFOOD Evaluation)

This project strictly adheres to the DOGFOOD offline/local evaluation constraints. It requires **zero cloud accounts**, **no external authentication-as-a-service**, and **no hosted databases**.

### Prerequisites
- Docker & Docker Compose installed on your machine.

### One-Command Startup
Open your terminal in the root of the project directory and run:

```bash
docker-compose up --build
```

**What this does:**
1. Spins up a local, containerized **MongoDB** instance.
2. Builds and bundles the full-stack Node.js/React application using Vite.
3. Automatically runs database seeders to populate the platform with sample events, users, and tracks.
4. Generates the required `.dogfood.toml` file for automated endpoint checking.

### Accessing the Platform
Once the container finishes building, the portal will be live at:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🧪 Testing the UI (Dogfood Portal)

We have bypassed standard email/password authentication to make hackathon evaluation absolutely seamless. 

1. Click **Log In** in the top right corner of the app.
2. You will be greeted by the **Dogfood Test Portal**.
3. Select the persona you want to test:
   - **Participant:** Instantly logs you into a student builder profile.
   - **Organizer:** Instantly logs you in with full event-creation and judging-assignment capabilities.
   - **Judge:** When prompted, enter `judge@example.com` to log in as the pre-seeded test judge.
4. The system will securely log you in via a local, HTTP-only JWT session cookie.

---

## 🏗️ Architecture & Tech Stack
- **Frontend:** React 19, Wouter (Routing), Tailwind CSS (Full Native Dark Mode), Lucide Icons.
- **Backend:** Node.js, Express, **tRPC** (for End-to-End type safety without REST APIs).
- **Database:** MongoDB (via Mongoose), running entirely locally in Docker.

---

## 🎥 Demo
*(Insert link to your 5-minute pitch/demo video here)*

## 📜 License
MIT License
