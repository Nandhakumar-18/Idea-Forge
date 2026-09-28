# Threat Model: IdeaForge Hackathon Platform

## 1. System Overview
IdeaForge is an offline-capable, isolated hackathon evaluation and submission platform. The primary assets are user submissions, judge evaluations, and final normalized scores. The platform is designed to operate without external APIs, neutralizing third-party availability risks.

## 2. Threat Analysis

### 2.1 Sybil Voting & Ballot Stuffing
* **Threat:** Participants create multiple accounts to upvote their own projects or inflate their popularity.
* **Mitigation:** The T3 Public voting tier requires an explicit user registration. Rate-limiting is implemented on the submission and voting endpoints. We map votes to the `User.id` and restrict each user to one vote per project. 

### 2.2 Judge Collusion & Bias
* **Threat:** A judge intentionally gives extremely high scores to a friend's project, or extremely low scores to competitors.
* **Mitigation:**
  1. **Algorithmic Normalization:** The platform implements Cross-Judge Score Normalization (Z-Score). A judge who systematically gives 100s will have their scores scaled down towards the global mean, neutralizing severe bias.
  2. **Role Isolation:** Judges can only see projects assigned to them. They cannot view other judges' scores until the Organizer locks and publishes the results.
  3. **Conflicts of Interest:** The UI explicitly forces judges to declare a conflict, which prevents them from scoring that project.

### 2.3 Submission Scraping
* **Threat:** Automated scripts scraping project data from the gallery before the deadline.
* **Mitigation:** The public gallery only displays the title and summary. Links to repositories and demo videos remain hidden from participants until the `resultsPublished` flag is flipped by an Organizer. 

### 2.4 Deadline Gaming
* **Threat:** Teams attempt to bypass the submission deadline by updating their payloads after the clock runs out.
* **Mitigation:** The `submissions_close` deadline is strictly enforced in the Express backend (`dogfoodRoutes.ts` and `ideaForge.ts`). Any `POST /submit` payload received after `new Date() > event.submissions_close` is immediately rejected with a HTTP 400 Bad Request.

## 3. Deployment Security
By running exclusively via `docker-compose` without external hosted databases or third-party authentication services, IdeaForge eliminates the risk of API key compromise or vendor outages. Database access is strictly confined to the internal Docker network on port `27017`.
