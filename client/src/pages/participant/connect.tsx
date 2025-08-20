import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Search, Filter, Users, MapPin, Star, MessageCircle,
  UserPlus, Github, Twitter, Linkedin, Globe, Trophy,
  Code, Zap, Heart
} from "lucide-react";

export default function ParticipantConnect() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch participants and organizers from API
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user
  });

  // Fetch organizations from API
  const { data: organizationsData, isLoading: organizationsLoading } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: !!user
  });

  if (authLoading || usersLoading || organizationsLoading) {
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

  // Process participants data
  const participants = usersData ? usersData.filter(u => u.role === 'participant' && u._id !== user._id).map(u => ({
    id: u._id,
    name: u.name || u.username,
    username: u.username,
    avatar: u.avatar || (u.name ? u.name.substring(0, 2).toUpperCase() : 'U'),
    bio: u.bio || 'No bio available',
    location: u.location || 'Unknown location',
    skills: u.skills || [],
    rank: u.rank || Math.floor(Math.random() * 100) + 1, // Fallback to random rank if not available
    points: u.points || 0,
    eventsWon: u.eventsWon || 0,
    isOnline: Math.random() > 0.5, // Random online status for demo
    isFriend: false, // Friendship status would come from a separate API
    github: u.github,
    linkedin: u.linkedin,
    twitter: u.twitter,
    website: u.website
  })) : [];

  // Process organizers data
  const organizers = organizationsData ? organizationsData.map(org => ({
    id: org._id,
    name: org.name,
    username: org.username || org.name.toLowerCase().replace(/\s+/g, ''),
    avatar: org.avatar || org.name.substring(0, 2).toUpperCase(),
    bio: org.description || 'No description available',
    location: org.location || 'Unknown location',
    eventsHosted: org.eventsHosted || 0,
    totalParticipants: org.totalParticipants || 0,
    website: org.website,
    twitter: org.twitter,
    linkedin: org.linkedin
  })) : [];

  // Filter based on search query and category
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "All" || 
      selectedCategory === "Participants" ||
      (selectedCategory === "Friends" && p.isFriend) ||
      (selectedCategory === "Online" && p.isOnline) ||
      (selectedCategory === "Nearby" && p.location);
    
    return matchesSearch && matchesCategory;
  });

  const filteredOrganizers = organizers.filter(o => {
    const matchesSearch = searchQuery === "" || 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.bio && o.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "All" || 
      selectedCategory === "Organizers";
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ParticipantTabs />
      
      <main>
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Connect & Network
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Build your network by connecting with fellow participants and organizers
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search people..." 
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

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {['All', 'Participants', 'Organizers', 'Friends', 'Online', 'Nearby'].map((category) => (
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

          {/* Participants Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Participants
              </h2>
              <Badge variant="secondary">
                {filteredParticipants.length} people
              </Badge>
            </div>

            {filteredParticipants.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParticipants.map((participant) => (
                  <Card key={participant.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {participant.avatar}
                          </div>
                          {participant.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {participant.name}
                          </h3>
                          <p className="text-sm text-gray-500">@{participant.username}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{participant.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                            #{participant.rank}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {participant.bio}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {participant.skills && participant.skills.length > 0 ? (
                          <>
                            {participant.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {participant.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{participant.skills.length - 3}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No skills listed</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div>
                          <div className="text-sm font-semibold">{participant.points.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Points</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{participant.eventsWon}</div>
                          <div className="text-xs text-gray-500">Wins</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">#{participant.rank}</div>
                          <div className="text-xs text-gray-500">Rank</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {participant.github && (
                            <a href={`https://github.com/${participant.github}`} className="text-gray-400 hover:text-gray-600">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {participant.linkedin && (
                            <a href={`https://linkedin.com/in/${participant.linkedin}`} className="text-gray-400 hover:text-blue-600">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {participant.twitter && (
                            <a href={`https://twitter.com/${participant.twitter}`} className="text-gray-400 hover:text-blue-500">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {participant.website && (
                            <a href={participant.website} className="text-gray-400 hover:text-gray-600">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant={participant.isFriend ? "secondary" : "default"}>
                            {participant.isFriend ? (
                              <>
                                <Heart className="w-4 h-4 mr-1" />
                                Friends
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Connect
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              selectedCategory === "Participants" || selectedCategory === "All" || 
              selectedCategory === "Friends" || selectedCategory === "Online" || 
              selectedCategory === "Nearby" ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Participants Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {searchQuery ? 
                      'No participants match your search criteria. Try adjusting your search.' : 
                      'There are no participants available at the moment.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Organizers Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Event Organizers
              </h2>
              <Badge variant="secondary">
                {filteredOrganizers.length} organizations
              </Badge>
            </div>

            {filteredOrganizers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredOrganizers.map((organizer) => (
                  <Card key={organizer.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {organizer.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {organizer.name}
                          </h3>
                          <p className="text-sm text-gray-500">@{organizer.username}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{organizer.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {organizer.bio}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-semibold">{organizer.eventsHosted}</div>
                          <div className="text-xs text-gray-500">Events Hosted</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-semibold">
                            {typeof organizer.totalParticipants === 'number' ? 
                              organizer.totalParticipants.toLocaleString() : '0'}
                          </div>
                          <div className="text-xs text-gray-500">Total Participants</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {organizer.website && (
                            <a href={`https://${organizer.website}`} className="text-gray-400 hover:text-gray-600">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {organizer.linkedin && (
                            <a href={`https://linkedin.com/company/${organizer.linkedin}`} className="text-gray-400 hover:text-blue-600">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {organizer.twitter && (
                            <a href={`https://twitter.com/${organizer.twitter}`} className="text-gray-400 hover:text-blue-500">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm">
                            <Star className="w-4 h-4 mr-1" />
                            Follow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              selectedCategory === "Organizers" || selectedCategory === "All" ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Organizers Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    {searchQuery ? 
                      'No organizers match your search criteria. Try adjusting your search.' : 
                      'There are no organizers available at the moment.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More People
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
