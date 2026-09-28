const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, 'server/models.ts');
let content = fs.readFileSync(modelsPath, 'utf8');

if (!content.includes('OrganizerProfile')) {
  const insertIndex = content.indexOf('export interface Team');
  const insertContent = 
export interface OrganizerProfile {
  id: number;
  userId: number;
  organizationName: string | null;
  website: string | null;
  bio: string | null;
  updatedAt: Date;
}
const organizerProfileSchema = new Schema<OrganizerProfile>({
  userId: { type: Number, required: true, unique: true },
  organizationName: { type: String, maxlength: 180, default: null },
  website: { type: String, maxlength: 255, default: null },
  bio: { type: String, maxlength: 1000, default: null },
  updatedAt: { type: Date, default: Date.now, required: true },
});
organizerProfileSchema.plugin(autoIncrementPlugin, { modelName: "organizerProfile" });
export const OrganizerProfile = mongoose.models.OrganizerProfile || mongoose.model<OrganizerProfile>("OrganizerProfile", organizerProfileSchema);

;
  content = content.slice(0, insertIndex) + insertContent + content.slice(insertIndex);
  fs.writeFileSync(modelsPath, content);
  console.log('Added OrganizerProfile schema to models.ts');
} else {
  console.log('OrganizerProfile schema already exists');
}
