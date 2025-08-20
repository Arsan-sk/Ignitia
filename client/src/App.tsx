import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import CreateEvent from "@/pages/create-event";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

// Organization dashboard pages
import OrgIndex from "@/pages/org/index";
import OrgHome from "@/pages/org/home";
import OrgEvents from "@/pages/org/events";
import OrgEventsNew from "@/pages/org/events-new";
import EventDetails from "@/pages/org/event-details";
import OrgSubmissions from "@/pages/org/submissions";
import OrgJudging from "@/pages/org/judging";
import OrgLeaderboard from "@/pages/org/leaderboard";
import OrgParticipants from "@/pages/org/participants";
import OrgAnnouncements from "@/pages/org/announcements";
import OrgAnalytics from "@/pages/org/analytics";
import OrgProfile from "@/pages/org/profile";
import OrgSettings from "@/pages/org/settings";

// Participant dashboard pages
import ParticipantIndex from "@/pages/participant/index";
import ParticipantHome from "@/pages/participant/home";
import ParticipantEvents from "@/pages/participant/events";
import ParticipantConnect from "@/pages/participant/connect";
import ParticipantLeaderboard from "@/pages/participant/leaderboard";
import ParticipantProfile from "@/pages/participant/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Organization dashboard routes */}
      <Route path="/org" component={OrgIndex} />
      <Route path="/org/:orgId/home" component={OrgHome} />
      <Route path="/org/:orgId/overview" component={OrgHome} /> {/* Redirect legacy route */}
      <Route path="/org/:orgId/events" component={OrgEvents} />
      <Route path="/org/:orgId/events/new" component={OrgEventsNew} />
      <Route path="/org/:orgId/events/:eventId" component={EventDetails} />
      <Route path="/org/:orgId/submissions" component={OrgSubmissions} />
      <Route path="/org/:orgId/judging" component={OrgJudging} />
      <Route path="/org/:orgId/leaderboard" component={OrgLeaderboard} />
      <Route path="/org/:orgId/participants" component={OrgParticipants} />
      <Route path="/org/:orgId/announcements" component={OrgAnnouncements} />
      <Route path="/org/:orgId/analytics" component={OrgAnalytics} />
      <Route path="/org/:orgId/profile" component={OrgProfile} />
      <Route path="/org/:orgId/settings" component={OrgSettings} />
      
      {/* Participant dashboard routes */}
      <Route path="/participant" component={ParticipantIndex} />
      <Route path="/participant/home" component={ParticipantHome} />
      <Route path="/participant/events" component={ParticipantEvents} />
      <Route path="/participant/connect" component={ParticipantConnect} />
      <Route path="/participant/leaderboard" component={ParticipantLeaderboard} />
      <Route path="/participant/profile" component={ParticipantProfile} />
      
      {/* General routes */}
      <Route path="/events" component={Events} />
      <Route path="/create-event" component={CreateEvent} />
      
      {/* Auth routes - support both /login and /auth/login */}
      <Route path="/login" component={Login} />
      <Route path="/auth/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/register" component={Register} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
