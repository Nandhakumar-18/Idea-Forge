const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/ideaForge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for OrganizerProfile
content = content.replace('StudentProfile,', 'StudentProfile, OrganizerProfile,');

// Add organizerProfile router
const insertIndex = content.indexOf('discovery: router({');
const insertStr =   organizerProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      requireDb(await getDb());
      if (ctx.user.role !== "organizer") return null;
      const profile = await OrganizerProfile.findOne({ userId: ctx.user.id }).lean();
      return profile ?? null;
    }),
    save: protectedProcedure.input(z.object({ organizationName: z.string().max(180).optional(), website: z.string().max(255).optional(), bio: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
      requireDb(await getDb());
      if (ctx.user.role !== "organizer") throw new TRPCError({ code: "FORBIDDEN" });
      await OrganizerProfile.findOneAndUpdate(
        { userId: ctx.user.id },
        { userId: ctx.user.id, organizationName: input.organizationName ?? null, website: input.website ?? null, bio: input.bio ?? null },
        { upsert: true, new: true }
      );
      return { success: true };
    }),
  }),
  ;

content = content.slice(0, insertIndex) + insertStr + content.slice(insertIndex);
fs.writeFileSync(filePath, content);
console.log('Added organizerProfile router');
