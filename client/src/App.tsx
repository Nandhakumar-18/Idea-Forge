import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import { ArrowUpRight, CircleUserRound, Hammer, LayoutDashboard, LogOut, Sparkles, Trophy, Moon, Sun } from "lucide-react";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

const Home = lazy(() => import("@/pages/Home"));
const Forge = lazy(() => import("@/pages/Forge"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const OrganizerPage = lazy(() => import("@/pages/OrganizerPage"));
const JudgePage = lazy(() => import("@/pages/JudgePage"));
const CertificatePage = lazy(() => import("@/pages/CertificatePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));

function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();
  if (!switchable || !toggleTheme) return null;
  
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className="grid h-10 w-10 place-items-center rounded-full text-[#82839a] hover:bg-[#f5f5fa] dark:hover:bg-[#292943] hover:text-[#373858] dark:hover:bg-[#2c2d4a] dark:text-[#a1a1b5] dark:hover:text-[#e4e4eb]">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  if (location === "/login") return null;

  const links = [];
  if (user?.role === "organizer") {
    links.push({ href: "/events", label: "Explore events", icon: LayoutDashboard });
    links.push({ href: "/organizer", label: "Organizer studio", icon: Hammer });
  } else if (user?.role === "judge") {
    links.push({ href: "/events", label: "Explore events", icon: LayoutDashboard });
    links.push({ href: "/judge", label: "Judging", icon: Trophy });
  } else {
    links.push({ href: "/forge", label: "AI discovery", icon: Sparkles });
    links.push({ href: "/events", label: "Explore events", icon: LayoutDashboard });
    if (isAuthenticated) {
      links.push({ href: "/profile", label: "My Profile & Results", icon: CircleUserRound });
    }
  }
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 dark:bg-[#151528]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <Link href="/" className="group flex items-center gap-3" aria-label="IdeaForge home">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#2422a7] text-white shadow-[0_8px_18px_rgba(36,34,167,.22)] transition-transform group-hover:-rotate-3">
            <Hammer className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="leading-tight"><span className="block text-[16px] font-extrabold tracking-[-.04em] text-[#17183c] dark:text-[#f1f1fa]">IdeaForge<span className="text-[#6e67ef]">.io</span></span><span className="block text-[10px] font-semibold tracking-[.13em] text-[#898a9f] dark:text-[#8888a3]">BUILD WHAT MATTERS</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map(item => {
            const Icon = item.icon;
            const active = location === item.href;
            return <Link key={item.href} href={item.href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${active ? "bg-[#efefff] dark:bg-[#2c2b53] text-[#2422a7] dark:text-[#8e8aff]" : "text-[#65667d] dark:text-[#a3a3bb] hover:bg-[#f5f5fa] dark:hover:bg-[#292943] hover:text-[#222345] dark:hover:text-[#f1f1fa]"}`}><Icon className="h-4 w-4" />{item.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? <>
            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-[#e9e9f1] dark:border-[#35354f] py-1 pl-1 pr-3 text-sm font-semibold text-[#34354f] dark:text-[#f1f1fa] hover:bg-[#fafaff] dark:hover:bg-[#292943]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#eeedff] text-[#302daf] dark:text-[#8e8aff]"><CircleUserRound className="h-4 w-4" /></span><span className="hidden max-w-[120px] truncate sm:block">{user?.name || "My profile"}</span></Link>
            <button onClick={logout} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-full text-[#82839a] hover:bg-[#f5f5fa] dark:hover:bg-[#292943] hover:text-[#373858] dark:hover:text-[#f1f1fa]"><LogOut className="h-4 w-4" /></button>
          </> : <button onClick={() => startLogin()} className="inline-flex items-center gap-2 rounded-full bg-[#2422a7] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(36,34,167,.18)] transition hover:-translate-y-0.5 hover:bg-[#191782]">Get started <ArrowUpRight className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-t border-[#f3f3f8] px-3 py-2 lg:hidden">
        {links.map(item => <Link key={item.href} href={item.href} className={`rounded-full px-3 py-2 text-xs font-semibold ${location === item.href ? "bg-[#efefff] dark:bg-[#2c2b53] text-[#2422a7] dark:text-[#8e8aff]" : "text-[#73748a]"}`}>{item.label}</Link>)}
      </div>
    </header>
  );
}

function RouteFallback() { return <div className="mx-auto max-w-[1000px] px-5 py-20"><div className="h-8 w-56 animate-pulse rounded-lg bg-[#ececf4]" /><div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-[#f0f0f6]" /></div>; }

function AppRouter() {
  return <><AppHeader /><main className="min-h-[calc(100vh-73px)]"><Suspense fallback={<RouteFallback />}><Switch>
    <Route path="/" component={Home} />
    <Route path="/forge" component={Forge} />
    <Route path="/events" component={EventsPage} />
    <Route path="/events/:id" component={EventsPage} />
    <Route path="/profile" component={ProfilePage} />
    <Route path="/organizer" component={OrganizerPage} />
    <Route path="/judge" component={JudgePage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/certificates/:code" component={CertificatePage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></Suspense></main><footer className="border-t border-[#ededf4] dark:border-[#35354f] bg-white dark:bg-[#1e1e36]"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-5 py-6 text-xs text-[#8b8ca0] sm:flex-row sm:items-center lg:px-10"><span>© 2026 IdeaForge.io · The right challenge can change everything.</span><span className="flex items-center gap-1.5">Built for builders <span className="text-[#6c66ed]">●</span> Grounded in real event data</span></div></footer></>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster /><AppRouter /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
