import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Hammer, Sparkles, Trophy } from "lucide-react";
import { useLocation } from "wouter";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { refresh } = useAuth();
  
  const loginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: async () => {
      await refresh();
      setLocation("/");
    }
  });

  const demoUsers = [
    { name: "participant", label: "Log in as Participant", desc: "Submit projects & vote", icon: Code2, color: "bg-[#2926a6] text-white" },
    { name: "judge_a", label: "Log in as Judge", desc: "Evaluate & score projects", icon: Trophy, color: "bg-[#514dc4]" },
    { name: "organizer", label: "Log in as Organizer", desc: "Manage event & judges", icon: Hammer, color: "bg-[#1f1d7d]" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[450px] flex-col items-center justify-center px-5 py-24">
      <div className="w-full rounded-2xl border border-[#e8e8f1] dark:border-[#35354f] bg-white dark:bg-[#1e1e36] p-8 shadow-[0_8px_26px_rgba(32,33,74,.04)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#2926a6] text-white">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-[#292a47] dark:text-[#f1f1fa]">
            Dogfood Test Portal
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7b7c91] dark:text-[#8888a3]">
            Authentication-as-a-service is disabled. Select a seeded test persona to instantly access the platform.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {demoUsers.map((u) => (
            <Button
              key={u.name}
              disabled={loginMutation.isPending}
              onClick={() => {
                if (u.name === "judge_a") {
                  const email = window.prompt("Enter your registered Judge email:");
                  if (!email) return;
                  loginMutation.mutate({ username: email, isJudgeEmail: true }, {
                    onError: (err) => alert(err.message)
                  });
                } else {
                  loginMutation.mutate({ username: u.name });
                }
              }}
              className={`flex h-16 w-full items-center justify-between rounded-xl ${u.color} px-5 font-bold text-white transition-opacity hover:opacity-90`}
            >
              <div className="flex items-center gap-4">
                <u.icon className="h-5 w-5 opacity-80" />
                <div className="flex flex-col items-start">
                  <span className="text-[15px]">{u.label}</span>
                  <span className="text-xs font-normal opacity-70">{u.desc}</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 opacity-70" />
            </Button>
          ))}
        </div>
        
        <div className="mt-8 text-center text-xs text-[#a1a1b5]">
          <p>
            Real-world Google & Auth0 integration will be restored <br/> after the dogfood evaluation phase.
          </p>
        </div>
      </div>
    </div>
  );
}

