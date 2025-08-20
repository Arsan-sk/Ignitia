import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  Users, 
  Trophy, 
  User 
} from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/participant/home" },
  { id: "events", label: "Events", icon: Calendar, path: "/participant/events" },
  { id: "connect", label: "Connect", icon: Users, path: "/participant/connect" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/participant/leaderboard" },
  { id: "profile", label: "Profile", icon: User, path: "/participant/profile" },
];

export default function ParticipantTabs() {
  const [location] = useLocation();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            const Icon = tab.icon;
            
            return (
              <Link key={tab.id} href={tab.path}
                className={cn(
                  "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200",
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon
                  className={cn(
                    "mr-2 h-5 w-5 transition-colors duration-200",
                    isActive
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                  )}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
