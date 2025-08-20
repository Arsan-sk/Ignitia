import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Calendar, Clock, Users, Trophy, Search, Filter,
  MapPin, Star, ExternalLink, ArrowRight
} from "lucide-react";

export default function ParticipantEvents() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Fetch events from API
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user
  });

  if (authLoading || eventsLoading) {
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
  
  // Filter events based on search query and category
  const filteredEvents = events ? events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || 
      (event.tags && event.tags.includes(selectedCategory)) ||
      event.type === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  }) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ParticipantTabs />
      
      <main>
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Find hackathons, competitions, and coding challenges to showcase your skills
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search events..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Event Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {['All', 'Hackathons', 'AI/ML', 'Web3', 'Mobile', 'Gaming', 'IoT'].map((category) => (
                <Badge 
                  key={category}
                  variant={category === selectedCategory ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div 
                    className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative"
                    style={{
                      backgroundImage: `url(${event.banner || '/images/event-placeholder.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`${
                          event.status === 'Registration Open' ? 'bg-green-500' :
                          event.status === 'Submission Phase' ? 'bg-blue-500' :
                          event.status === 'Coming Soon' ? 'bg-gray-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                        {event.prize}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-white/80 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{event.isVirtual ? 'Virtual' : event.location}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Difficulty:</span>
                        <Badge variant="outline">{event.difficulty}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Participants:</span>
                        <span className="font-medium">{event.participants.toLocaleString()} / {event.maxParticipants.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        by {event.organizer}
                      </div>
                      <Button size="sm" className="group-hover:translate-x-1 transition-transform">
                        <span className="mr-2">View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Events Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                  {searchQuery || selectedCategory !== 'All' ? 
                    'No events match your current filters. Try adjusting your search criteria.' : 
                    'There are no events available at the moment. Check back later for upcoming events.'}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Events
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
