import { Trophy, Flame, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ['/api/dashboard/user', user?.id],
    enabled: !!user?.id
  });

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col w-full py-6 px-4 space-y-6">
        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overview</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-sm">Global Rank</span>
              </div>
              <span className="font-bold text-light-primary dark:text-dark-primary">
                #{(userStats as any)?.rank || '---'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Active Events</span>
              </div>
              <span className="font-bold text-light-accent dark:text-dark-accent">
                {(userStats as any)?.events?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2 text-light-primary dark:text-dark-primary" />
              <span className="text-sm">Create Event</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Search className="w-4 h-4 mr-2 text-light-primary dark:text-dark-primary" />
              <span className="text-sm">Find Teams</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Users className="w-4 h-4 mr-2 text-light-primary dark:text-dark-primary" />
              <span className="text-sm">Join Event</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Activity</h3>
          <div className="space-y-2">
            {(userStats as any)?.events?.slice(0, 2).map((event: any) => (
              <div key={event.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                <p className="font-medium">Registered for {event.title}</p>
                <p className="text-gray-500">{event.type} • {new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {(!(userStats as any)?.events || (userStats as any).events.length === 0) && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
