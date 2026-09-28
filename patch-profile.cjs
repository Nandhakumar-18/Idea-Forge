const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/ProfilePage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const insertView = 
function OrganizerProfileView() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const profileQuery = trpc.ideaForge.organizerProfile.get.useQuery();
  const save = trpc.ideaForge.organizerProfile.save.useMutation({
    onSuccess: async () => {
      toast.success("Organizer profile saved.");
      await utils.ideaForge.organizerProfile.get.invalidate();
    },
    onError: error => toast.error(error.message)
  });
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setOrganizationName(profileQuery.data.organizationName || "");
      setWebsite(profileQuery.data.website || "");
      setBio(profileQuery.data.bio || "");
    }
  }, [profileQuery.data]);

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-9 lg:px-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#7773da] dark:text-[#8e8aff]">Organizer space</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em] text-[#21223e] dark:text-[#f1f1fa]">Your organizer profile.</h1>
          <p className="mt-2 text-sm text-[#797a8f] dark:text-[#8888a3]">Manage your organization details and public identity.</p>
        </div>
        <div className="rounded-xl border border-[#e9e9f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] px-4 py-3 text-xs text-[#797a8f] dark:text-[#8888a3]">
          <span className="font-bold text-[#454660] dark:text-[#e5e5f1]">Role:</span> Organizer
        </div>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <section className="rounded-[22px] border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#7a75db] dark:text-[#8e8aff]">Organization Details</p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-[#2b2c49] dark:text-[#f1f1fa]">Make it official</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0efff] dark:bg-[#2c2b53] text-[#5550ca]"><UsersRound className="h-5 w-5" /></span>
            </div>
            {profileQuery.isLoading ? <div className="mt-5 h-32 animate-pulse rounded-xl bg-[#f0f0f6] dark:bg-[#2c2b53]" /> : (
              <form onSubmit={e => { e.preventDefault(); save.mutate({ organizationName: organizationName.trim() || undefined, website: website.trim() || undefined, bio: bio.trim() || undefined }); }} className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Organization Name"><input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="e.g. NextGen Builders" maxLength={180} /></Field>
                <Field label="Website"><input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" type="url" maxLength={255} /></Field>
                <Field label="Bio / Description" wide><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell participants about your organization..." maxLength={1000} /></Field>
                <div className="sm:col-span-2 pt-2"><Button disabled={save.isPending} className="h-10 rounded-xl bg-[#2926a6] px-5 text-xs font-bold text-white shadow-md hover:bg-[#201d84]">{save.isPending ? "Saving..." : "Save profile"}</Button></div>
              </form>
            )}
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-[22px] border border-[#e7e6f4] dark:border-[#35354f] bg-gradient-to-br from-[#2825aa] to-[#4741c3] p-5 text-white">
            <h3 className="text-sm font-bold">Ready to host?</h3>
            <p className="mt-1 text-xs leading-5 text-white/75">Head over to the Organizer Studio to create and publish events.</p>
            <Link href="/organizer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white hover:gap-2">Organizer studio <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
;

content = content.replace('export default function ProfilePage() {', insertView + '\nexport default function ProfilePage() {');
content = content.replace('return <div className="mx-auto max-w-[1200px]', 'if (user?.role === "organizer") return <OrganizerProfileView />;\n  return <div className="mx-auto max-w-[1200px]');
fs.writeFileSync(filePath, content);
console.log('Updated ProfilePage.tsx');
