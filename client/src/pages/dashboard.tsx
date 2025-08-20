import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import { 
  Trophy, Users, Calendar, Target, TrendingUp, Star, 
  Plus, Award, Activity, MapPin, Clock, ChevronRight,
  BookOpen, Code, Zap
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/user', user?.id],
    enabled: !!user?.id
  });

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Redirect organizers to their organization dashboard
  if (user.role === 'organizer') {
    return <Redirect to="/org" />;
  }

  // Redirect participants to new participant dashboard
  if (user.role === 'participant') {
    return <Redirect to="/participant" />;
  }

  // Legacy participant dashboard (should not be reached)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to innovate? Discover new challenges and showcase your skills.
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">1,250</div>
              <div className="text-sm text-blue-100">Total Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/events">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Discover Events</h3>
                      <p className="text-gray-500 text-sm">Find hackathons & competitions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Find Team</h3>
                    <p className="text-gray-500 text-sm">Connect with innovators</p>
                  </div>
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
              <Link href="/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">TechCrunch Hackathon {i}</h4>
                        <p className="text-sm text-gray-500">Round 2 • Due in 3 days</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Your Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Global Rank</span>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">#127</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Events Won</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submissions</span>
                <span className="font-semibold">12</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['First Place Winner', 'Team Player', 'Innovation Master'].map((achievement, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
}