import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit, MapPin, Link as LinkIcon, Users, Calendar, Award, 
  Trophy, Star, Heart, Share2, ExternalLink, Globe,
  Instagram, Twitter, Linkedin, Github, Mail, Phone
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrgProfile() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: organization, isLoading } = useQuery({
    queryKey: ["/api/orgs", orgId],
    enabled: !!orgId
  });

  const { data: events } = useQuery({
    queryKey: ["/api/orgs", orgId, "events"],
    enabled: !!orgId
  });

  const { data: followers } = useQuery({
    queryKey: ["/api/orgs", orgId, "followers"],
    enabled: !!orgId
  });

  const { data: badges } = useQuery({
    queryKey: ["/api/orgs", orgId, "badges"],
    enabled: !!orgId
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/orgs/${orgId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orgs", orgId] });
      toast({ title: "Organization updated successfully" });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update organization",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <OrgTopBar />
        <OrgTabs orgId={orgId} />
        <main className="max-w-6xl mx-auto container-padding section-spacing">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  const org = organization || {};
  const eventsList = events || [];
  const followersList = followers || [];
  const badgesList = badges || [];

  const getOrgBadges = () => {
    const badges = [];
    if (eventsList.length >= 10) badges.push({ name: "Veteran Organizer", icon: "🏅", description: "Hosted 10+ events" });
    if (eventsList.length >= 50) badges.push({ name: "Event Master", icon: "👑", description: "Hosted 50+ events" });
    if (followersList.length >= 1000) badges.push({ name: "Community Leader", icon: "⭐", description: "1000+ followers" });
    if (eventsList.some((e: any) => e.type === 'hackathon')) badges.push({ name: "Hackathon Host", icon: "💻", description: "Hackathon organizer" });
    return badges;
  };

  const stats = {
    totalEvents: eventsList.length,
    activeEvents: eventsList.filter((e: any) => e.status === 'ongoing').length,
    totalParticipants: eventsList.reduce((sum: number, event: any) => sum + (event.participantCount || 0), 0),
    followers: followersList.length,
    avgRating: 4.8 // Mock data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 theme-transition">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-6xl mx-auto container-padding section-spacing fade-in">
        {/* Profile Header */}
        <div className="relative slide-in">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl relative overflow-hidden card-hover glow-on-hover">
            {org.bannerUrl && (
              <img 
                src={org.bannerUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-gray-900">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Organization Profile</DialogTitle>
                    <DialogDescription>
                      Update your organization's public profile information
                    </DialogDescription>
                  </DialogHeader>
                  {/* Edit form would go here */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Organization Name</label>
                      <Input defaultValue={org.name} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea defaultValue={org.description} rows={4} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Website</label>
                      <Input defaultValue={org.website} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-16 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={org.logoUrl} alt={org.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {org.name?.slice(0, 2).toUpperCase() || "OR"}
                  </AvatarFallback>
                </Avatar>
                {/* Verification Badge */}
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {org.name || "Organization Name"}
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Verified
                      </Badge>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                      {org.description || "Inspiring the next generation of innovators through world-class hackathons and tech events."}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {org.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{org.location}</span>
                        </div>
                      )}
                      {org.website && (
                        <a href={org.website} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <LinkIcon className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {new Date(org.createdAt || Date.now()).getFullYear()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 bounce-in">
          {[
            { label: "Events", value: stats.totalEvents, icon: Calendar },
            { label: "Active", value: stats.activeEvents, icon: Trophy },
            { label: "Participants", value: stats.totalParticipants.toLocaleString(), icon: Users },
            { label: "Followers", value: stats.followers.toLocaleString(), icon: Heart },
            { label: "Rating", value: `${stats.avgRating}⭐`, icon: Star }
          ].map((stat, index) => (
            <Card key={index} className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg card-hover interactive glow-on-hover">
              <CardContent className="p-4">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-purple-400 transition-colors duration-300" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Organization Badges */}
        {getOrgBadges().length > 0 && (
          <Card className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {getOrgBadges().map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-gray-500">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events ({eventsList.length})</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followersList.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Events */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventsList.slice(0, 3).map((event: any, index: number) => (
                        <Link key={event.id} href={`/org/${orgId}/events/${event.id}`}>
                          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                              {event.type === 'hackathon' && '🏆'}
                              {event.type === 'conference' && '🎤'}
                              {event.type === 'meetup' && '👥'}
                              {event.type === 'fest' && '🎪'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{event.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                <span>{new Date(event.startAt).toLocaleDateString()}</span>
                                <Badge className="text-xs" variant="outline">{event.status}</Badge>
                                <span>{event.participantCount || 0} participants</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Links & Contact */}
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Connect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: Globe, label: "Website", value: org.website },
                      { icon: Mail, label: "Email", value: org.email },
                      { icon: Twitter, label: "Twitter", value: org.twitter },
                      { icon: Linkedin, label: "LinkedIn", value: org.linkedin },
                      { icon: Instagram, label: "Instagram", value: org.instagram },
                      { icon: Github, label: "GitHub", value: org.github }
                    ].filter(item => item.value).map((item, index) => (
                      <a key={index} href={item.value} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <item.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{item.label}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-semibold text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Event Size</span>
                      <span className="font-semibold">{Math.round(stats.totalParticipants / stats.totalEvents) || 0} people</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-semibold text-blue-600">&lt; 2 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsList.map((event: any) => (
                <Link key={event.id} href={`/org/${orgId}/events/${event.id}`}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {event.bannerUrl && (
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-32 object-cover rounded-t-lg" />
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{event.type}</Badge>
                        <Badge className={`text-xs ${
                          event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          event.status === 'published' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{event.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(event.startAt).toLocaleDateString()}</span>
                        <span>{event.participantCount || 0} participants</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Followers Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The follower system is being implemented. Users will be able to follow organizations to get updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg">
              <CardHeader>
                <CardTitle>About {org.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Mission</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {org.mission || "To foster innovation and creativity in the tech community by organizing world-class events and competitions that bring together brilliant minds."}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Founded</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {new Date(org.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {org.location || "Global"}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Hackathons", "Tech Conferences", "Developer Meetups", "Innovation Challenges"].map((specialty, index) => (
                      <Badge key={index} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
