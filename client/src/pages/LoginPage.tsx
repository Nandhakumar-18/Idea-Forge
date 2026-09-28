import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCircle } from "lucide-react";
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
    { name: "participant", label: "Participant (Hacker)", role: "user" },
    { name: "organizer", label: "Event Organizer", role: "organizer" },
    { name: "judge_a", label: "Judge A", role: "judge" },
    { name: "judge_b", label: "Judge B", role: "judge" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center px-5 py-24 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f0efff] text-[#514dc4]">
        <UserCircle className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-[#292a47]">
        Test Environment Login
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#7b7c91]">
        Authentication-as-a-service is disabled for this dogfood evaluation. 
        Select a seeded test account below to instantly log in and evaluate different roles.
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {demoUsers.map((u) => (
          <Button
            key={u.name}
            disabled={loginMutation.isPending}
            onClick={() => loginMutation.mutate({ username: u.name })}
            className="flex h-12 w-full items-center justify-between rounded-xl bg-[#2926a6] px-4 font-bold"
          >
            <span>Log in as {u.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}
