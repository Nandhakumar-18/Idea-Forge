import { Submission, Event, DogfoodScore, Evaluation } from "./models";

export async function evaluateSubmissionWithAI(submissionId: number) {
  // Fetch the submission and its event
  const submission = await Submission.findOne({ id: submissionId }).lean();
  if (!submission) throw new Error("Submission not found");

  const event = await Event.findOne({ id: submission.eventId }).lean();
  if (!event) throw new Error("Event not found");

  // Deterministic mock evaluation to avoid external API calls
  // This satisfies the hackathon rule: no external APIs / network connectivity
  const baseScore = 6;
  const lengthBonus = Math.min(3, Math.floor(submission.summary.length / 50));
  const hasRepoBonus = submission.repositoryUrl ? 1 : 0;
  
  const aiResult = {
    criteria: {
      "Innovation": baseScore + hasRepoBonus,
      "Technical Complexity": baseScore + lengthBonus,
      "UI/UX": baseScore + Math.max(0, lengthBonus - 1)
    },
    comment: `Offline AI Judge (Deterministic Mock):\nBased on the summary length and provided repository, this project demonstrates a solid effort. It fulfills basic requirements and has a repo link. Note: True AI evaluation is disabled to comply with strict offline judging rules.`
  };

  const scores = Object.values(aiResult.criteria) as number[];
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const evaluation = await Evaluation.create({
    assignmentId: submission.id,
    score: averageScore,
    feedback: aiResult.comment,
    submittedAt: new Date()
  });

  await DogfoodScore.create({
    judge: 99999, // Representing AI Judge
    project: submission.id,
    criteria: aiResult.criteria,
    comment: aiResult.comment
  });

  return { evaluation, aiResult };
}
