import { Heart, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activity/recent'],
    refetchInterval: 10000 // Refresh every 10 seconds for real-time feel
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-space font-semibold">Live Activity Feed</h3>
        <Button variant="ghost" className="text-sm text-light-primary dark:text-dark-primary hover:underline">
          View All
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {(activities as any[])?.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to show</p>
          </div>
        )}
        
        {(activities as any[])?.map((activity: any) => (
          <div key={activity.id} className="flex space-x-3 animate-slide-up">
            <div className="flex-shrink-0">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <Plus className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">System</span>
                <span className="text-gray-600 dark:text-gray-400"> recorded a new </span>
                <span className="font-medium text-light-primary dark:text-dark-primary">{activity.type}</span>
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-500">0</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mock activity items for better UX */}
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-light-primary to-purple-600 dark:from-dark-primary dark:to-teal-500 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-light-primary dark:text-dark-primary">New Event: Mobile App Challenge</span>
              <span className="text-gray-600 dark:text-gray-400"> is now open for registration!</span>
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">15 minutes ago</span>
              <Button variant="link" className="p-0 h-auto text-xs text-light-primary dark:text-dark-primary">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
