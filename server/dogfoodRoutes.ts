import { Router, Request, Response } from "express";
import { DogfoodProject, DogfoodScore, Event, User } from "./models";
import { sdk } from "./_core/sdk";

const dogfoodRouter = Router();

dogfoodRouter.get("/gallery", async (req: Request, res: Response) => {
  const projects = await DogfoodProject.find();
  res.json(projects);
});

dogfoodRouter.post("/submit", async (req: Request, res: Response) => {
  const { title, summary } = req.body;
  const event = await Event.findOne();
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  if (event.submissions_close && new Date(event.submissions_close) < new Date()) {
    return res.status(400).json({ error: "Submissions are closed" });
  }
  
  const project = await DogfoodProject.create({
    title,
    summary,
    team: req.body.team || 1,
    track: req.body.track || 1,
    repo_url: req.body.repo_url || "",
  });
  res.json(project);
});

dogfoodRouter.get("/judge/:id/scores", async (req: Request, res: Response) => {
  let cookie = req.cookies ? req.cookies["IdeaForge-Session"] : undefined;
  if (!cookie && req.headers.cookie) {
    const match = req.headers.cookie.match(/IdeaForge-Session=([^;]+)/);
    cookie = match ? match[1] : undefined;
  }
  const session = await sdk.verifySession(cookie);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await User.findOne({ openId: session.openId });
  if (!user || user.openId !== req.params.id) {
    // Optionally check if user id matches judge id, but prompt says "Return 403 if they don't match"
    // Wait, the prompt says "Return 403 if they don't match. Then return DogfoodScore.find({ judge: ... })"
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const judgeId = req.params.id;
  const scores = await DogfoodScore.find({ judge: judgeId });
  res.json(scores);
});

dogfoodRouter.get("/export.csv", async (req: Request, res: Response) => {
  const scores = await DogfoodScore.find();
  const projects = await DogfoodProject.find();
  
  let csv = "type,id,info\n";
  projects.forEach(p => {
    csv += `project,${p.id},"${p.title}"\n`;
  });
  scores.forEach(s => {
    csv += `score,${s.id},"${s.comment}"\n`;
  });
  
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});

export default dogfoodRouter;


