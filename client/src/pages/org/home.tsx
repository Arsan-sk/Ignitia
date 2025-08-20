import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Calendar, Users, Award, Activity, 
  Plus, ArrowRight, Clock, MapPin
} from "lucide-react";

export default function OrgHome() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const { data: overview, isLoading } = useQuery({
    queryKey: ["/api/orgs", orgId, "overview"],
    enabled: !!orgId
  });

  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/orgs", orgId, "events", { limit: 5 }],
    enabled: !!orgId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <OrgTopBar />
        <OrgTabs orgId={orgId} />
        <main className="max-w-7xl mx-auto container-padding section-spacing">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-7xl mx-auto container-padding section-spacing">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's what's happening with your organization
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Events</p>
                  <p className="text-3xl font-bold">{stats.activeEvents || 0}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-blue-100">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Participants</p>
                  <p className="text-3xl font-bold">{stats.totalParticipants || 0}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-green-100">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+25% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Ongoing Rounds</p>
                  <p className="text-3xl font-bold">{stats.ongoingRounds || 0}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-purple-100">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm">Active competitions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Recent Submissions</p>
                  <p className="text-3xl font-bold">{stats.submissions7d || 0}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-orange-100">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Last 7 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Events</CardTitle>
                  <CardDescription>Your latest event activities</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentEvents && recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                          {event.type === 'hackathon' && '🏆'}
                          {event.type === 'conference' && '🎤'}
                          {event.type === 'meetup' && '👥'}
                          {event.type === 'fest' && '🎪'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                            <Badge 
                              className={`text-xs ${
                                event.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                event.status === 'published' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(event.startAt).toLocaleDateString()}</span>
                            {event.venue && (
                              <>
                                <MapPin className="w-3 h-3 ml-3 mr-1" />
                                <span className="truncate">{event.venue}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No events yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-lg border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Participants
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  View Submissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-lg border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events starting soon</CardDescription>
              </CardHeader>
              <CardContent>
                {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {overview.upcomingEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-500">{new Date(event.startAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
