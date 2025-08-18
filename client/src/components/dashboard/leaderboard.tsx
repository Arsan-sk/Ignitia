import { Crown, Medal, Trophy, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function Leaderboard() {
  const { user } = useAuth();
  
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard/global'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: userRank } = useQuery({
    queryKey: ['/api/users', user?.id, 'rank'],
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topThree = (leaderboard as any[])?.slice(0, 3) || [];
  const others = (leaderboard as any[])?.slice(3) || [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-space font-semibold">Global Leaderboard</h3>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" className="bg-light-primary dark:bg-dark-primary">
            Global
          </Button>
          <Button variant="outline" size="sm">
            University
          </Button>
          <Button variant="outline" size="sm">
            Friends
          </Button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center mb-6 space-x-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="text-center">
            <div className="relative">
              <Avatar className="w-12 h-12 mx-auto mb-2 ring-4 ring-silver">
                <AvatarImage src={topThree[1].avatarUrl || undefined} />
                <AvatarFallback>{topThree[1].firstName[0]}{topThree[1].lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-silver rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">2</span>
              </div>
            </div>
            <p className="text-sm font-medium">{topThree[1].firstName}</p>
            <p className="text-xs text-gray-500">{topThree[1].globalPoints} pts</p>
            <div className="w-16 h-16 bg-silver mx-auto mt-2 rounded-t-lg flex items-end justify-center">
              <Medal className="w-4 h-4 text-white mb-2" />
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="text-center">
            <div className="relative">
              <Avatar className="w-14 h-14 mx-auto mb-2 ring-4 ring-gold badge-glow">
                <AvatarImage src={topThree[0].avatarUrl || undefined} />
                <AvatarFallback>{topThree[0].firstName[0]}{topThree[0].lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">1</span>
              </div>
            </div>
            <p className="text-sm font-bold">{topThree[0].firstName}</p>
            <p className="text-xs text-gold font-semibold">{topThree[0].globalPoints} pts</p>
            <div className="w-16 h-20 bg-gold mx-auto mt-2 rounded-t-lg flex items-end justify-center">
              <Crown className="w-5 h-5 text-white mb-2" />
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="text-center">
            <div className="relative">
              <Avatar className="w-10 h-10 mx-auto mb-2 ring-4 ring-bronze">
                <AvatarImage src={topThree[2].avatarUrl || undefined} />
                <AvatarFallback>{topThree[2].firstName[0]}{topThree[2].lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-bronze rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </div>
            </div>
            <p className="text-sm font-medium">{topThree[2].firstName}</p>
            <p className="text-xs text-gray-500">{topThree[2].globalPoints} pts</p>
            <div className="w-16 h-12 bg-bronze mx-auto mt-2 rounded-t-lg flex items-end justify-center">
              <Medal className="w-3 h-3 text-white mb-1" />
            </div>
          </div>
        )}
      </div>

      {/* Remaining Rankings */}
      <div className="space-y-2">
        {/* Current User Highlight */}
        {user && userRank && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-6">#{userRank.rank}</span>
              <Avatar className="w-8 h-8 ring-2 ring-light-primary dark:ring-dark-primary">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-light-primary dark:text-dark-primary">
                  You ({user.firstName} {user.lastName})
                </p>
                <p className="text-xs text-gray-500">{user.university} • {user.role}</p>
              </div>
            </div>
            <span className="font-bold text-light-primary dark:text-dark-primary">{user.globalPoints} pts</span>
          </div>
        )}
        
        {others.slice(0, 5).map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-400 w-6">#{index + 4}</span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.university} • {user.role}</p>
              </div>
            </div>
            <span className="font-bold">{user.globalPoints} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
