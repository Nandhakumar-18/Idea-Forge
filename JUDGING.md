# Judging & Scoring Methodology

IdeaForge implements a comprehensive judging system designed to ensure fairness, isolation, and auditability.

## Role Isolation
The platform strictly enforces role boundaries. Judges have dedicated accounts and can only evaluate projects assigned to them. Participants cannot view scores or feedback until the Organizer explicitly toggles the \`resultsPublished\` flag on the Event. 

## Judge Assignment Strategy
Currently, judges evaluate projects based on track assignments. When a judge accesses their dashboard (`/api/dogfood/judge/:id/scores`), the backend enforces that the authenticated session matches the requested judge ID, preventing score scraping or unauthorized modifications.

## Scoring Methodology
Each score is associated with specific `criteria` (a map of criterion-to-score) and a qualitative `comment`. The total score for a project is derived by aggregating these criteria across all judges assigned to the project. 

## Normalization Method
To address "judge severity" (where one judge consistently scores lower or higher than another), IdeaForge relies on event-level min-max scaling to establish baseline comparisons. 

*Future Enhancement (Bonus):* The architecture is designed to easily support cross-judge score normalization (z-score normalization) by calculating the mean and standard deviation of each judge's scores, ensuring that a harsh judge does not unfairly penalize a project.
