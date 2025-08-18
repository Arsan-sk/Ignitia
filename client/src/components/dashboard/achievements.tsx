import { Trophy, Code, Users, Star, Flame, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const achievementIcons = {
  winner: Trophy,
  code_master: Code,
  team_player: Users,
  rising_star: Star,
  hot_streak: Flame,
  certified: Award
};

const achievementColors = {
  winner: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
  code_master: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
  team_player: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
  rising_star: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
  hot_streak: "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
  certified: "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20"
};

const achievementBgColors = {
  winner: "bg-gold",
  code_master: "bg-blue-500",
  team_player: "bg-green-500",
  rising_star: "bg-purple-500",
  hot_streak: "bg-red-500",
  certified: "bg-cyan-500"
};

export default function Achievements() {
  const { user } = useAuth();
  
  const { data: badges, isLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'badges'],
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock achievements for demonstration
  const mockAchievements = [
    { type: 'winner', name: 'Winner', description: 'AI Challenge', icon: Trophy },
    { type: 'code_master', name: 'Code Master', description: '50 Commits', icon: Code },
    { type: 'team_player', name: 'Team Player', description: '10 Teams', icon: Users },
    { type: 'rising_star', name: 'Rising Star', description: 'Top 50', icon: Star },
    { type: 'hot_streak', name: 'Hot Streak', description: '5 Events', icon: Flame },
    { type: 'certified', name: 'Certified', description: '8 Certs', icon: Award }
  ];

  const displayAchievements = (badges as any[]) && (badges as any[]).length > 0 ? badges : mockAchievements;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-space font-semibold">Recent Achievements</h3>
        <Button variant="ghost" className="text-sm text-light-primary dark:text-dark-primary hover:underline">
          View Profile
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(displayAchievements as any[]).slice(0, 6).map((achievement: any, index: number) => {
          const IconComponent = achievementIcons[achievement.type as keyof typeof achievementIcons] || Trophy;
          const bgColorClass = achievementBgColors[achievement.type as keyof typeof achievementBgColors] || 'bg-gray-500';
          const gradientClass = achievementColors[achievement.type as keyof typeof achievementColors] || 'from-gray-50 to-gray-100';
          
          return (
            <div
              key={achievement.id || index}
              className={`flex flex-col items-center p-4 rounded-lg bg-gradient-to-b ${gradientClass} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
            >
              <div className={`w-12 h-12 ${bgColorClass} rounded-full flex items-center justify-center mb-2 badge-glow group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-medium text-center">{achievement.name}</p>
              <p className="text-xs text-gray-500 text-center">{achievement.description}</p>
            </div>
          );
        })}
      </div>

      {(!(badges as any[]) || (badges as any[]).length === 0) && (
        <div className="text-center text-gray-500 mt-4">
          <p className="text-sm">No achievements yet. Participate in events to earn badges!</p>
        </div>
      )}
    </div>
  );
}
