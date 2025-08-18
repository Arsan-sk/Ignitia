import { Trophy, Award, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function WelcomeSection() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ['/api/dashboard/user', user?.id],
    enabled: !!user?.id
  });

  return (
    <div className="bg-gradient-to-r from-light-primary to-purple-600 dark:from-dark-primary dark:to-teal-500 rounded-2xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-space font-bold mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-blue-100 dark:text-purple-100 text-lg">
            Ready to ignite your next innovation?
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-gold" />
              <span className="text-sm">{userStats?.badges?.length || 0} Badges</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-green-300" />
              <span className="text-sm">8 Certificates</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-blue-200" />
              <span className="text-sm">156 Connections</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-gold animate-bounce-slow" />
          </div>
        </div>
      </div>
    </div>
  );
}
