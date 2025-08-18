import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Sun, Moon, Bell, Flame } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 glass-effect border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-light-primary to-dark-primary rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="font-space font-bold text-xl gradient-text">Ignitia</span>
              </a>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard">
                <a className="text-gray-700 dark:text-gray-300 hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                  Dashboard
                </a>
              </Link>
              <Link href="/events">
                <a className="text-gray-700 dark:text-gray-300 hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                  Events
                </a>
              </Link>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                Leaderboard
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                Network
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-300" />
              )}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full notification-dot"></span>
              </Button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 ring-2 ring-light-primary dark:ring-dark-primary">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <Button variant="ghost" onClick={logout} className="text-sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
