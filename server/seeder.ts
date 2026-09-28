import fs from "fs";
import { User, DogfoodTrack, DogfoodJudge, DogfoodTeam, DogfoodProject, DogfoodScore } from "./models";
import { sdk } from "./_core/sdk";

export async function runSeeder() {
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  
  if ((await DogfoodProject.countDocuments()) > 0) {
    console.log("Seeder: DogfoodProject already populated, skipping.");
    return;
  }

  console.log("Seeder: Reading fixtures.json...");
  let data: any;
  try {
    data = JSON.parse(fs.readFileSync(process.cwd() + "/fixtures.json", "utf-8"));
  } catch (err) {
    console.error("Seeder: fixtures.json not found or invalid json", err);
    data = { tracks: [], judges: [], teams: [], projects: [], scores: [] };
  }

  for (const track of data.tracks || []) {
    await DogfoodTrack.create(track);
  }
  for (const judge of data.judges || []) {
    await DogfoodJudge.create(judge);
  }
  for (const team of data.teams || []) {
    await DogfoodTeam.create(team);
  }
  for (const proj of data.projects || []) {
    await DogfoodProject.create(proj);
  }
  for (const score of data.scores || []) {
    await DogfoodScore.create(score);
  }
  console.log("Seeder: Models populated from fixtures.");

  const usersToCreate = [
    { name: "organizer", role: "organizer" },
    { name: "judge_a", role: "judge" },
    { name: "judge_b", role: "judge" },
    { name: "participant", role: "user" },
  ];

  let authSection = "[auth]\n";
  let judgeAToken = "";
  for (const u of usersToCreate) {
    const openId = "dogfood_" + u.name + "_" + Date.now();
    await User.create({
      openId,
      name: u.name,
      role: u.role,
    });
    const token = await sdk.createSessionToken(openId, { name: u.name, expiresInMs: ONE_YEAR_MS });
    console.log(`Generated JWT for ${u.name}: ${token}`);
    authSection += `${u.name} = "Cookie: IdeaForge-Session=${token}"\n`;
    if (u.name === "judge_a") {
      judgeAToken = openId;
    }
  }

  const tomlContent = `[portal]
base_url = "http://localhost:8080"
[tiers]
claimed = ["T1", "T2"]
pitch = "IdeaForge AI-agent first hackathon platform."
${authSection}[routes]
gallery      = "/api/dogfood/gallery"
submit       = "/api/dogfood/submit"
judge_scores = "/api/dogfood/judge/${judgeAToken}/scores"
peer_scores  = "/api/dogfood/judge/${judgeAToken}/scores"
csv_export   = "/api/dogfood/export.csv"
`;

  const tomlPath = process.cwd() + "/.dogfood.toml";
  fs.writeFileSync(tomlPath, tomlContent);
  console.log(`Seeder: Wrote ${tomlPath}`);
}
