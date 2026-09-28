const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "server/ideaForge.ts");
let content = fs.readFileSync(file, "utf8");

const profileRouterCode = `
  organizerProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      let profile = await OrganizerProfile.findOne({ userId: ctx.user.id }).lean();
      if (!profile) {
        const newProfile = new OrganizerProfile({ userId: ctx.user.id, organizationName: ctx.user.name + "'s Org", bio: "", websiteUrl: "" });
        await newProfile.save();
        profile = await OrganizerProfile.findOne({ userId: ctx.user.id }).lean();
      }
      return profile;
    }),
    save: protectedProcedure.input(z.object({ organizationName: z.string().min(2).max(100), bio: z.string().max(500).optional(), websiteUrl: z.string().url().or(z.literal("")).optional() })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      await OrganizerProfile.updateOne({ userId: ctx.user.id }, { $set: { organizationName: input.organizationName, bio: input.bio, websiteUrl: input.websiteUrl } }, { upsert: true });
      return { success: true };
    }),
  }),
`;

if (!content.includes("organizerProfile: router({")) {
  content = content.replace("export const ideaForgeRouter = router({", "export const ideaForgeRouter = router({" + profileRouterCode);
  fs.writeFileSync(file, content);
  console.log("Added organizerProfile router");
} else {
  console.log("Already has organizerProfile router");
}
