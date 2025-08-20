import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Calendar, Clock, Users, Trophy, Search, Filter,
  MapPin, Star, ExternalLink, ArrowRight
} from "lucide-react";

export default function ParticipantEvents() {
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
                  variant={category === 'All' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock events data - will be replaced with real API data */}
            {[
              {
                id: 1,
                title: "TechCrunch Hackathon 2024",
                description: "Build the next big thing in 48 hours. Focus on AI, blockchain, and sustainability.",
                status: "Registration Open",
                registrationEnds: "2024-04-15",
                startDate: "2024-04-20",
                endDate: "2024-04-22",
                location: "San Francisco, CA",
                isVirtual: false,
                prize: "$50,000",
                participants: 2500,
                maxParticipants: 3000,
                difficulty: "Intermediate",
                tags: ["AI", "Blockchain", "Web3"],
                organizer: "TechCrunch",
                banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
              },
              {
                id: 2,
                title: "AI Innovation Challenge",
                description: "Create AI solutions for healthcare, education, or climate change.",
                status: "Submission Phase",
                registrationEnds: "2024-03-30",
                startDate: "2024-04-01",
                endDate: "2024-04-30",
                location: "Virtual",
                isVirtual: true,
                prize: "$25,000",
                participants: 1200,
                maxParticipants: 1500,
                difficulty: "Advanced",
                tags: ["AI", "Healthcare", "Education"],
                organizer: "AI Foundation",
                banner: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop"
              },
              {
                id: 3,
                title: "Web3 Builder Summit",
                description: "Build decentralized applications that will shape the future of the internet.",
                status: "Registration Open",
                registrationEnds: "2024-05-01",
                startDate: "2024-05-10",
                endDate: "2024-05-12",
                location: "Austin, TX",
                isVirtual: false,
                prize: "$75,000",
                participants: 800,
                maxParticipants: 1000,
                difficulty: "Intermediate",
                tags: ["Web3", "DeFi", "NFT"],
                organizer: "Ethereum Foundation",
                banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop"
              },
              {
                id: 4,
                title: "Mobile App Innovation",
                description: "Design and develop mobile apps that solve real-world problems.",
                status: "Coming Soon",
                registrationEnds: "2024-06-01",
                startDate: "2024-06-15",
                endDate: "2024-06-17",
                location: "New York, NY",
                isVirtual: false,
                prize: "$30,000",
                participants: 0,
                maxParticipants: 2000,
                difficulty: "Beginner",
                tags: ["Mobile", "React Native", "Flutter"],
                organizer: "Google Developers",
                banner: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop"
              },
              {
                id: 5,
                title: "Climate Tech Challenge",
                description: "Develop technology solutions to combat climate change and promote sustainability.",
                status: "Registration Open",
                registrationEnds: "2024-04-25",
                startDate: "2024-05-01",
                endDate: "2024-05-03",
                location: "Virtual",
                isVirtual: true,
                prize: "$40,000",
                participants: 600,
                maxParticipants: 800,
                difficulty: "Intermediate",
                tags: ["Climate", "IoT", "Data Science"],
                organizer: "Climate Foundation",
                banner: "https://images.unsplash.com/photo-1569163139394-de44cb6ff4b8?w=400&h=200&fit=crop"
              },
              {
                id: 6,
                title: "Gaming Revolution Hackathon",
                description: "Create the next generation of games using cutting-edge technologies.",
                status: "Registration Open",
                registrationEnds: "2024-05-15",
                startDate: "2024-05-25",
                endDate: "2024-05-27",
                location: "Los Angeles, CA",
                isVirtual: false,
                prize: "$60,000",
                participants: 1100,
                maxParticipants: 1500,
                difficulty: "Advanced",
                tags: ["Gaming", "VR", "AR"],
                organizer: "Epic Games",
                banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop"
              }
            ].map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div 
                  className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative"
                  style={{
                    backgroundImage: `url(${event.banner})`,
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
            ))}
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
