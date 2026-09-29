# Idea Forge MVP — Feature and Bug Tracker

Updated: 2026-09-26

## Completed

- [x] React/tRPC WebDev scaffold, responsive brand shell, route-level code splitting, homepage, discovery, catalogue, event detail, profile, organizer, judge, and certificate routes.
- [x] Natural-language discovery with built-in LLM intent extraction, deterministic fallback, grounded recommendations, match factors, and eligibility reasons.
- [x] Event/profile persistence and structured event requirements; reviewed additive migrations for result publication and eligibility fields.
- [x] Server-side event/deadline/team/profile checks for registration; invite joining, registration linkage, team membership, and team-size enforcement.
- [x] Membership-scoped submissions with append-only versions; judge enrollment, organizer assignment, blind review access, conflict declarations, and scoring.
- [x] Aggregated and normalized results; lock-before-publish lifecycle; participant-facing results only after publication.
- [x] Organizer certificate issuance, participant achievement history, and unique-code printable certificate view.
- [x] Rule and ownership test coverage: `pnpm test` passed (2 test files, 12 tests).
- [x] Final `pnpm check` passed; final production `pnpm build` passed.
- [x] Live discovery test returned four grounded event records for a free online AI healthcare team-of-four request.
- [x] Desktop and mobile routes/screenshots reviewed; all four mobile navigation items wrap visibly; browser console had no runtime errors.
- [x] Final WebDev checkpoint saved.

## Known MVP limitations — not current defects

- Student status relies on self-entered profile details; external school/identity verification is not included. Free-text requirements still require participant/organizer confirmation; only structured criteria are automated.
- Submissions support summaries and repository/demo URLs, not file uploads. No email/in-app notification worker or external event-feed crawler is included.
- Organizer verification, full moderation/audit UI, configurable judging rubrics, and advanced judge-allocation safeguards are outside MVP scope.
- Certificates are printable HTML/browser PDF, without signed PDF or QR/blockchain verification. Scores use event-level min–max scaling and do not correct for judge severity.
- Full end-to-end role workflows and concurrent database transactions have not been integration-tested. Add those tests before production-scale use.
- Production deployment, threat-model review, and operational monitoring are separate from the verified temporary preview.

## Bug log

All product and runtime bugs have been resolved.

- [x] Resolved non-blocking **large Forge-page chunk** warning by dynamically lazy-loading the AI chat's Markdown and syntax-highlighting dependencies (`streamdown`).
