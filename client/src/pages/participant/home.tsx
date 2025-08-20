import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Trophy, Users, Calendar, Target, TrendingUp, Star, 
  Plus, Award, Activity, MapPin, Clock, ChevronRight,
  BookOpen, Code, Zap, Heart, UserPlus, Medal, User
} from "lucide-react";

export default function ParticipantHome() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/user', user?.id],
    enabled: !!user?.id
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== 'participant') {
    return <Redirect to="/org" />;
  }

  // Use data from API
  const { data: participantDashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: [`/api/dashboard/participant/${user?.id}`],
    enabled: !!user?.id
  });

  const stats = {
    eventsParticipated: dashboardData?.events?.length || participantDashboard?.stats?.eventsParticipated || 0,
    wins: dashboardData?.wins || participantDashboard?.stats?.wins || 0,
    friends: dashboardData?.friends || participantDashboard?.stats?.friends || 0,
    teamsWorkedWith: dashboardData?.teams?.length || participantDashboard?.stats?.teamsWorkedWith || 0,
    totalPoints: dashboardData?.totalPoints || participantDashboard?.stats?.totalPoints || 0,
    rank: dashboardData?.rank || participantDashboard?.stats?.rank || 0
  };

  const activeEvents = participantDashboard?.activeEvents || [];
  const achievements = participantDashboard?.achievements || [];
  
  // Map badge types to icons
  const getBadgeIcon = (type) => {
    switch(type) {
      case 'winner': return Trophy;
      case 'team': return Users;
      case 'innovation': return Zap;
      default: return Award;
    }
  };
  
  // Map badge types to colors
  const getBadgeColor = (type) => {
    switch(type) {
      case 'winner': return "from-yellow-400 to-orange-500";
      case 'team': return "from-blue-400 to-purple-500";
      case 'innovation': return "from-green-400 to-teal-500";
      default: return "from-purple-400 to-indigo-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ParticipantTabs />
      
      <main>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user.firstName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">
                    Ready to innovate? Discover new challenges and showcase your skills.
                  </p>
                  <div className="flex space-x-4">
                    <Link href="/participant/events">
                      <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Calendar className="w-5 h-5 mr-2" />
                        Discover Events
                      </Button>
                    </Link>
                    <Link href="/participant/connect">
                      <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Find Team
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="text-right space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-blue-100">Total Points</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl font-bold">#{stats.rank}</div>
                    <div className="text-sm text-blue-100">Global Rank</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{stats.eventsParticipated}</p>
                        <p className="text-sm text-gray-500">Events Joined</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
                        <p className="text-sm text-gray-500">Wins</p>
                      </div>
                      <Trophy className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{stats.friends}</p>
                        <p className="text-sm text-gray-500">Friends</p>
                      </div>
                      <Heart className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{stats.teamsWorkedWith}</p>
                        <p className="text-sm text-gray-500">Teams</p>
                      </div>
                      <Users className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Events */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Your Active Events</span>
                  </CardTitle>
                  <Link href="/participant/events">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEvents.length > 0 ? activeEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium group-hover:text-blue-600 transition-colors">{event.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{event.status}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {event.daysLeft} days left
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {event.participants} participants
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            {event.prize}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-400 mt-1 mx-auto" />
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Active Events</h4>
                        <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                          <Link href="/participant/events">Discover Events</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Submitted project", event: "AI Innovation Challenge", time: "2 hours ago", icon: BookOpen },
                      { action: "Joined team", event: "TechCrunch Hackathon", time: "1 day ago", icon: Users },
                      { action: "Registered for", event: "Web3 Builder Summit", time: "3 days ago", icon: Calendar }
                    ].map((activity, i) => {
                      const Icon = activity.icon;
                      return (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.action}</span> {activity.event}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                  <Link href="/participant/profile">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.length > 0 ? achievements.map((achievement) => {
                      const Icon = getBadgeIcon(achievement.type);
                      const colorClass = getBadgeColor(achievement.type);
                      return (
                        <div key={achievement._id || achievement.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">{achievement.title || achievement.name}</span>
                            <p className="text-xs text-gray-500">Awarded {new Date(achievement.awardedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Achievements Yet</h4>
                        <p className="text-gray-500 mb-4">Participate in events to earn badges and achievements.</p>
                      </div>
                    )}
                  </div>
                  <Link href="/participant/profile">
                    <Button variant="outline" size="sm" className="w-full mt-4">View All Badges</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/participant/events">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link href="/participant/connect">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Find Teammates
                    </Button>
                  </Link>
                  <Link href="/participant/leaderboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="w-4 h-4 mr-2" />
                      View Rankings
                    </Button>
                  </Link>
                  <Link href="/participant/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Leaderboard Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Medal className="w-5 h-5" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Alex Chen", points: 2540, avatar: "AC" },
                      { rank: 2, name: "Sarah Wilson", points: 2380, avatar: "SW" },
                      { rank: 3, name: "Mike Johnson", points: 2220, avatar: "MJ" }
                    ].map((user) => (
                      <div key={user.rank} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          #{user.rank}
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.points.toLocaleString()} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/participant/leaderboard">
                    <Button variant="outline" size="sm" className="w-full mt-4">View Full Leaderboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
