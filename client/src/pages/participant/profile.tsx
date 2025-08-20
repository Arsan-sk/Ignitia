import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Trophy, Users, Calendar, Target, TrendingUp, Star, 
  Plus, Award, Activity, MapPin, Clock, ChevronRight,
  BookOpen, Code, Zap, Heart, UserPlus, Medal, Edit,
  Camera, Github, Twitter, Linkedin, Globe, Mail, Phone,
  Save, X, Check
} from "lucide-react";

export default function ParticipantProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/users/profile', user?.id],
    enabled: !!user?.id
  });

  const [formData, setFormData] = useState({
    bio: profileData?.bio || "",
    location: profileData?.location || "",
    website: profileData?.website || "",
    github: profileData?.github || "",
    twitter: profileData?.twitter || "",
    linkedin: profileData?.linkedin || "",
    phone: profileData?.phone || ""
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/users/profile/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile', user?.id] });
      setIsEditing(false);
    }
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

  // Mock data - will be replaced with real API data
  const profile = profileData || {
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop",
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}${user.lastName}`,
    bio: "Full-stack developer passionate about AI and blockchain technology. Love building innovative solutions and collaborating with amazing teams.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    github: "johndoe",
    twitter: "johndoe_dev",
    linkedin: "johndoe",
    phone: "+1 (555) 123-4567",
    joinedAt: "2023-01-15",
    stats: {
      friends: 127,
      followers: 89,
      following: 156,
      eventsParticipated: 15,
      wins: 4,
      teamsWorkedWith: 12,
      totalPoints: 2340,
      rank: 45
    }
  };

  const achievements = [
    { id: 1, title: "First Place Winner", description: "Won TechCrunch Hackathon 2024", icon: Trophy, color: "from-yellow-400 to-orange-500", rarity: "Legendary" },
    { id: 2, title: "Team Player", description: "Collaborated in 10+ teams", icon: Users, color: "from-blue-400 to-purple-500", rarity: "Epic" },
    { id: 3, title: "Innovation Master", description: "Created groundbreaking solutions", icon: Zap, color: "from-green-400 to-teal-500", rarity: "Rare" },
    { id: 4, title: "Code Warrior", description: "Submitted 20+ projects", icon: Code, color: "from-red-400 to-pink-500", rarity: "Epic" },
    { id: 5, title: "Rising Star", description: "Ranked in top 100", icon: Star, color: "from-purple-400 to-indigo-500", rarity: "Rare" },
    { id: 6, title: "Community Builder", description: "Connected 50+ developers", icon: Heart, color: "from-pink-400 to-rose-500", rarity: "Common" }
  ];

  const pastEvents = [
    {
      id: 1,
      title: "TechCrunch Hackathon 2024",
      rank: 1,
      date: "2024-03-15",
      participants: 500,
      prize: "$10,000",
      category: "Web3"
    },
    {
      id: 2,
      title: "AI Innovation Challenge",
      rank: 3,
      date: "2024-02-20",
      participants: 300,
      prize: "$5,000",
      category: "AI/ML"
    },
    {
      id: 3,
      title: "Blockchain Builder Summit",
      rank: 7,
      date: "2024-01-10",
      participants: 200,
      prize: "$2,500",
      category: "Blockchain"
    }
  ];

  const teams = [
    { id: 1, name: "Code Ninjas", events: 3, members: ["John Doe", "Jane Smith", "Bob Wilson"] },
    { id: 2, name: "Innovation Squad", events: 2, members: ["John Doe", "Alice Brown", "Mike Chen"] },
    { id: 3, name: "Tech Titans", events: 4, members: ["John Doe", "Sarah Davis", "Tom Anderson", "Lisa Park"] }
  ];

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ParticipantTabs />
      
      <main>
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Banner and Profile Section */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Banner */}
              <div 
                className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 relative"
                style={{ 
                  backgroundImage: `url(${profile.bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
                {isEditing && (
                  <label className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-2 cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <div className="flex items-start space-x-6 -mt-16 relative z-10">
                  <div className="relative">
                    <img
                      src={profile.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white shadow-lg"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            Rank #{profile.stats.rank}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(false)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveProfile}
                              disabled={updateProfileMutation.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile.stats.friends}
                        </div>
                        <div className="text-sm text-gray-500">Friends</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile.stats.eventsParticipated}
                        </div>
                        <div className="text-sm text-gray-500">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile.stats.wins}
                        </div>
                        <div className="text-sm text-gray-500">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile.stats.teamsWorkedWith}
                        </div>
                        <div className="text-sm text-gray-500">Teams</div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                      {isEditing ? (
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300">
                          {profile.bio || "No bio available"}
                        </p>
                      )}
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-wrap gap-4">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Location"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.website}
                              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="Website"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Github className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.github}
                              onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                              placeholder="GitHub username"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Twitter className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.twitter}
                              onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                              placeholder="Twitter handle"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Linkedin className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.linkedin}
                              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="LinkedIn username"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Phone number"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {profile.location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile.website && (
                            <a href={profile.website} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                              <Globe className="w-4 h-4" />
                              <span>Website</span>
                            </a>
                          )}
                          {profile.github && (
                            <a href={`https://github.com/${profile.github}`} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700">
                              <Github className="w-4 h-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {profile.twitter && (
                            <a href={`https://twitter.com/${profile.twitter}`} className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-600">
                              <Twitter className="w-4 h-4" />
                              <span>Twitter</span>
                            </a>
                          )}
                          {profile.linkedin && (
                            <a href={`https://linkedin.com/in/${profile.linkedin}`} className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                              <Linkedin className="w-4 h-4" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Achievements & Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className={`w-12 h-12 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{achievement.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Past Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Past Events Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            event.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            event.rank <= 3 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}>
                            #{event.rank}
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{event.participants} participants</span>
                              <span>•</span>
                              <Badge variant="outline">{event.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            {event.prize}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teams History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Teams Worked With</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div key={team.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{team.name}</h3>
                          <Badge variant="secondary">{team.events} events</Badge>
                        </div>
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 3).map((member, i) => (
                            <div 
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                              title={member}
                            >
                              {member.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                          {team.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs">
                              +{team.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Points</span>
                    <span className="font-semibold text-lg">{profile.stats.totalPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Global Rank</span>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      #{profile.stats.rank}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Win Rate</span>
                    <span className="font-semibold">
                      {((profile.stats.wins / profile.stats.eventsParticipated) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Team Events</span>
                    <span className="font-semibold">{profile.stats.teamsWorkedWith}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Friends Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Friends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { name: "Alex Chen", avatar: "AC" },
                      { name: "Sarah Wilson", avatar: "SW" },
                      { name: "Mike Johnson", avatar: "MJ" },
                      { name: "Lisa Park", avatar: "LP" },
                      { name: "Tom Davis", avatar: "TD" },
                      { name: "Anna Kim", avatar: "AK" }
                    ].map((friend, i) => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-1">
                          {friend.avatar}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{friend.name}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/participant/connect">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Friends
                    </Button>
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
