import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
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

  // Mock data - will be replaced with real API data
  const participants = [
    {
      id: 1,
      name: "Alex Chen",
      username: "alexchen",
      avatar: "AC",
      bio: "Full-stack developer passionate about AI and machine learning. Love building scalable solutions.",
      location: "San Francisco, CA",
      skills: ["React", "Python", "TensorFlow", "Node.js"],
      rank: 23,
      points: 3450,
      eventsWon: 5,
      isOnline: true,
      isFriend: false,
      github: "alexchen",
      linkedin: "alex-chen-dev"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "SW",
      bio: "UI/UX Designer with a passion for creating beautiful and functional interfaces.",
      location: "New York, NY",
      skills: ["Figma", "React", "CSS", "Design Systems"],
      rank: 47,
      points: 2890,
      eventsWon: 3,
      isOnline: false,
      isFriend: true,
      website: "sarahwilson.design",
      twitter: "sarah_designs"
    },
    {
      id: 3,
      name: "Mike Johnson",
      username: "mikej",
      avatar: "MJ",
      bio: "Backend engineer specializing in cloud architecture and distributed systems.",
      location: "Austin, TX",
      skills: ["Go", "Kubernetes", "AWS", "PostgreSQL"],
      rank: 12,
      points: 4120,
      eventsWon: 8,
      isOnline: true,
      isFriend: false,
      github: "mikejohnson",
      linkedin: "mike-johnson-eng"
    },
    {
      id: 4,
      name: "Lisa Park",
      username: "lisapark",
      avatar: "LP",
      bio: "Data scientist passionate about using AI to solve real-world problems.",
      location: "Seattle, WA",
      skills: ["Python", "R", "Machine Learning", "Data Viz"],
      rank: 34,
      points: 3100,
      eventsWon: 4,
      isOnline: false,
      isFriend: false,
      github: "lisapark",
      linkedin: "lisa-park-ds"
    },
    {
      id: 5,
      name: "Tom Anderson",
      username: "tomanderson",
      avatar: "TA",
      bio: "Mobile developer creating apps that make a difference. Flutter enthusiast.",
      location: "Los Angeles, CA",
      skills: ["Flutter", "Dart", "Firebase", "React Native"],
      rank: 67,
      points: 2340,
      eventsWon: 2,
      isOnline: true,
      isFriend: true,
      github: "tomanderson",
      website: "tomanderson.dev"
    },
    {
      id: 6,
      name: "Emma Davis",
      username: "emmadavis",
      avatar: "ED",
      bio: "DevOps engineer with expertise in CI/CD and infrastructure automation.",
      location: "Chicago, IL",
      skills: ["Docker", "Jenkins", "Terraform", "Python"],
      rank: 89,
      points: 1890,
      eventsWon: 1,
      isOnline: false,
      isFriend: false,
      github: "emmadavis",
      linkedin: "emma-davis-devops"
    }
  ];

  const organizers = [
    {
      id: 1,
      name: "TechCorp",
      username: "techcorp",
      avatar: "TC",
      bio: "Leading technology company organizing innovative hackathons worldwide.",
      location: "Silicon Valley, CA",
      eventsHosted: 15,
      totalParticipants: 12500,
      website: "techcorp.com",
      twitter: "techcorp"
    },
    {
      id: 2,
      name: "AI Foundation",
      username: "aifoundation",
      avatar: "AF",
      bio: "Non-profit organization promoting AI education and ethical development.",
      location: "Boston, MA",
      eventsHosted: 8,
      totalParticipants: 6750,
      website: "aifoundation.org",
      linkedin: "ai-foundation"
    }
  ];

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
                  variant={category === 'All' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
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
                {participants.length} people
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participants.map((participant) => (
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
          </div>

          {/* Organizers Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Event Organizers
              </h2>
              <Badge variant="secondary">
                {organizers.length} organizations
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {organizers.map((organizer) => (
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
                        <div className="text-lg font-semibold">{organizer.totalParticipants.toLocaleString()}</div>
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
