import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/navbar";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Events() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [eventType, setEventType] = useState("all");
  const [eventMode, setEventMode] = useState("all");

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events']
  });

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'conference':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'meetup':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'fest':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return '🌐';
      case 'offline':
        return '📍';
      case 'hybrid':
        return '🔄';
      default:
        return '📅';
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg theme-transition">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-space font-bold text-gray-900 dark:text-gray-100 mb-2">
            Discover Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find hackathons, conferences, meetups, and competitions to participate in
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="fest">Fest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventMode} onValueChange={setEventMode}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))
          ) : (events as any[])?.length > 0 ? (
            (events as any[]).map((event: any) => (
              <div key={event.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 card-hover border border-gray-200 dark:border-gray-700 overflow-hidden">
                {event.bannerUrl && (
                  <img 
                    src={event.bannerUrl} 
                    alt={`${event.title} banner`} 
                    className="w-full h-32 object-cover" 
                  />
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                    <span className="text-lg">{getModeIcon(event.mode)}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.startAt).toLocaleDateString()}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    {event.maxParticipants && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>Max {event.maxParticipants} participants</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-light-primary dark:bg-dark-primary hover:bg-blue-700 dark:hover:bg-purple-700">
                      Register Now
                    </Button>
                    <Button variant="outline" className="px-3">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mb-4">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Events Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || eventType !== 'all' || eventMode !== 'all' 
                  ? 'No events match your current filters. Try adjusting your search criteria.'
                  : 'No events are currently available. Check back later!'}
              </p>
              <Link href="/create-event">
                <Button className="bg-light-primary dark:bg-dark-primary">
                  Create Your Own Event
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {(events as any[]) && (events as any[]).length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-light-primary to-purple-600 dark:from-dark-primary dark:to-teal-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-space font-bold mb-4">Don't See What You're Looking For?</h3>
              <p className="text-blue-100 dark:text-purple-100 mb-6 max-w-2xl mx-auto">
                Create your own event and bring your community together. Our platform makes it easy to organize hackathons, conferences, and competitions.
              </p>
              <Link href="/create-event">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
