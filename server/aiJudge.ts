import { GoogleGenAI } from "@google/genai";
import { Submission, Event, DogfoodScore, Evaluation } from "./models";

export async function evaluateSubmissionWithAI(submissionId: number) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Cannot run automated AI judging.");
  }

  // Fetch the submission and its event
  const submission = await Submission.findOne({ id: submissionId }).lean();
  if (!submission) throw new Error("Submission not found");

  const event = await Event.findOne({ id: submission.eventId }).lean();
  if (!event) throw new Error("Event not found");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Prompt the AI to be a strict judge
  const prompt = `You are an expert technical hackathon judge evaluating a submission for the event: "${event.title}".
  
Event Description:
${event.description}

Project Title: ${submission.title}
Project Summary: ${submission.summary}
Project Repository: ${submission.repositoryUrl || "N/A"}
Project Demo: ${submission.demoUrl || "N/A"}

Please evaluate this project on three criteria: 
1. Innovation (1-10)
2. Technical Complexity (1-10)
3. UI/UX & Design (1-10)

Respond strictly with a JSON object in this exact format:
{
  "criteria": {
    "Innovation": <number>,
    "Technical Complexity": <number>,
    "UI/UX": <number>
  },
  "comment": "<Your detailed, constructive feedback paragraph explaining the scores>"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  if (!response.text) {
    throw new Error("AI failed to return an evaluation");
  }

  const aiResult = JSON.parse(response.text);

  // Calculate average score for the standard Evaluation table
  const scores = Object.values(aiResult.criteria) as number[];
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Save the evaluation (using ID 99999 for the AI Judge)
  const evaluation = await Evaluation.create({
    assignmentId: submission.id, // For simplicity in this demo, bind it directly to the submission
    score: averageScore,
    feedback: aiResult.comment,
    submittedAt: new Date()
  });

  // Also save to DogfoodScore for the automated checker requirements
  await DogfoodScore.create({
    judge: 99999, // Representing AI Judge
    project: submission.id,
    criteria: aiResult.criteria,
    comment: aiResult.comment
  });

  return { evaluation, aiResult };
}
