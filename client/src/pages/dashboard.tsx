import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import WelcomeSection from "@/components/dashboard/welcome-section";
import EventCard from "@/components/dashboard/event-card";
import Leaderboard from "@/components/dashboard/leaderboard";
import ActivityFeed from "@/components/dashboard/activity-feed";
import Achievements from "@/components/dashboard/achievements";

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

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg theme-transition">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="px-6">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="h-auto p-0 bg-transparent border-none">
                  <TabsTrigger
                    value="dashboard"
                    className="py-4 px-2 border-b-2 border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                  >
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="py-4 px-2 border-b-2 data-[state=active]:border-light-primary data-[state=active]:dark:border-dark-primary data-[state=active]:text-light-primary data-[state=active]:dark:text-dark-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                  >
                    My Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="teams"
                    className="py-4 px-2 border-b-2 data-[state=active]:border-light-primary data-[state=active]:dark:border-dark-primary data-[state=active]:text-light-primary data-[state=active]:dark:text-dark-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                  >
                    Teams
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="py-4 px-2 border-b-2 data-[state=active]:border-light-primary data-[state=active]:dark:border-dark-primary data-[state=active]:text-light-primary data-[state=active]:dark:text-dark-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                  >
                    Profile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
                  <WelcomeSection />

                  {/* Active Events Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-space font-bold text-gray-900 dark:text-gray-100">Active Events</h2>
                      <Link href="/events">
                        <Button className="bg-light-primary dark:bg-dark-primary hover:bg-blue-700 dark:hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Join Event
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {isLoading ? (
                        [...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        ))
                      ) : (dashboardData as any)?.events?.length > 0 ? (
                        (dashboardData as any).events.map((event: any) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            progress={Math.floor(Math.random() * 100)} // Mock progress
                            roundInfo="Round 2/3" // Mock round info
                            teamName="CodeCrafters" // Mock team name
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-500 mb-4">No active events found</p>
                          <Link href="/events">
                            <Button className="bg-light-primary dark:bg-dark-primary">
                              Browse Events
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Leaderboard & Social Feed Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Leaderboard />
                    <ActivityFeed />
                  </div>

                  {/* Achievements & Badges Section */}
                  <Achievements />

                  {/* Event Creation CTA */}
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-purple-600 dark:via-pink-600 dark:to-red-500 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-space font-bold mb-4">Ready to Host Your Own Event?</h3>
                    <p className="text-indigo-100 dark:text-purple-100 mb-6 max-w-2xl mx-auto">
                      Create hackathons, conferences, meetups, and competitions with our powerful platform. Engage your community and build lasting connections.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <Link href="/create-event">
                        <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </Link>
                      <Button variant="outline" className="border-white text-white hover:bg-white/10">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Demo
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="events" className="p-6">
                  <div className="text-center py-12">
                    <p className="text-gray-500">Events tab content coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="teams" className="p-6">
                  <div className="text-center py-12">
                    <p className="text-gray-500">Teams tab content coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="profile" className="p-6">
                  <div className="text-center py-12">
                    <p className="text-gray-500">Profile tab content coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Link href="/create-event">
          <Button className="w-14 h-14 bg-gradient-to-r from-light-primary to-purple-600 dark:from-dark-primary dark:to-teal-500 rounded-full shadow-lg hover:shadow-xl">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
