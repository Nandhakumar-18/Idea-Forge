import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const loginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: async () => {
      await refresh();
      setLocation("/");
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    loginMutation.mutate({ username: username.toLowerCase() });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[400px] flex-col items-center justify-center px-5 py-24">
      <div className="w-full rounded-2xl border border-[#e8e8f1] bg-white p-8 shadow-[0_8px_26px_rgba(32,33,74,.04)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#2926a6] text-white">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-[#292a47]">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7b7c91]">
            {isSignUp ? "Sign up to start building." : "Sign in to continue to IdeaForge."}
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#555671]">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1b5]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., organizer or judge_a"
                className="h-11 w-full rounded-lg border border-[#e7e7ef] bg-[#fafafd] pl-10 pr-3 text-sm outline-none focus:border-[#2926a6] focus:bg-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold text-[#555671]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1b5]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-[#e7e7ef] bg-[#fafafd] pl-10 pr-10 text-sm outline-none focus:border-[#2926a6] focus:bg-white"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1b5] hover:text-[#555671]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending || !username}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-[#2926a6] px-4 font-bold text-white transition-opacity hover:opacity-90"
          >
            {loginMutation.isPending ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-6 text-center text-xs text-[#a1a1b5]">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-[#2926a6] cursor-pointer">
              {isSignUp ? "Sign in" : "Sign up"}
            </span>
          </p>
          <p className="mt-4 rounded-lg bg-[#f0efff] p-3 text-left leading-5 text-[#514dc4]">
            <b>Hackathon Tip:</b> Use username <code className="font-bold">organizer</code>, <code className="font-bold">judge_a</code>, or <code className="font-bold">participant</code> to access the seeded dogfood accounts.
          </p>
        </div>
      </div>
    </div>
  );
}

