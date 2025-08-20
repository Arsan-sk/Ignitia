import { useState } from "react";
import { useParams, Link, Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, Edit, MoreVertical, Copy, Archive, Users, Calendar, 
  MapPin, Globe, ExternalLink, Clock, Trophy, FileText, BarChart3,
  Play, Pause, Settings, UserCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SubmissionsManager from "@/components/events/submissions-manager";
import JudgingManager from "@/components/events/judging-manager";

export default function EventDetails() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const eventId = params?.eventId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId
  });

  const { data: participants } = useQuery({
    queryKey: ["/api/events", eventId, "participants"],
    enabled: !!eventId && activeTab === "participants"
  });

  const { data: submissions } = useQuery({
    queryKey: ["/api/events", eventId, "submissions"],
    enabled: !!eventId && activeTab === "submissions"
  });

  const { data: rounds } = useQuery({
    queryKey: ["/api/events", eventId, "rounds"],
    enabled: !!eventId && activeTab === "submissions" && event?.type === 'hackathon'
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: "Event status updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update event status",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <OrgTopBar />
        <OrgTabs orgId={orgId} />
        <main className="max-w-7xl mx-auto container-padding section-spacing">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return <Redirect to={`/org/${orgId}/events`} />;
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: "badge-info",
      published: "badge-success", 
      ongoing: "badge-warning",
      completed: "badge-success",
      cancelled: "badge-danger",
      archived: "badge-secondary"
    };
    return statusStyles[status as keyof typeof statusStyles] || "badge-info";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hackathon": return "🏆";
      case "conference": return "🎤";
      case "meetup": return "👥";
      case "fest": return "🎪";
      default: return "📅";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-7xl mx-auto container-padding section-spacing">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/org/${orgId}/events`}>
              <Button variant="outline" size="sm" className="btn-outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className="heading-xl flex items-center gap-3">
                <span>{getTypeIcon(event.type)}</span>
                {event.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusBadge(event.status)}>
                  {event.status}
                </Badge>
                <span className="text-muted capitalize">{event.type}</span>
                <span className="text-muted capitalize">{event.mode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Actions */}
            {event.status === 'draft' && (
              <Button
                onClick={() => updateEventStatusMutation.mutate('published')}
                disabled={updateEventStatusMutation.isPending}
                className="btn-primary"
              >
                <Play className="w-4 h-4 mr-2" />
                Publish Event
              </Button>
            )}
            
            {event.status === 'published' && (
              <Button
                onClick={() => updateEventStatusMutation.mutate('ongoing')}
                disabled={updateEventStatusMutation.isPending}
                className="btn-primary"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Event
              </Button>
            )}

            {event.status === 'ongoing' && (
              <Button
                onClick={() => updateEventStatusMutation.mutate('completed')}
                disabled={updateEventStatusMutation.isPending}
                className="btn-secondary"
              >
                <Pause className="w-4 h-4 mr-2" />
                Complete Event
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-outline">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="judging" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Judging
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="card-professional">
                  <CardHeader className="card-header-professional">
                    <CardTitle>Event Description</CardTitle>
                  </CardHeader>
                  <CardContent className="card-content-professional">
                    <p className="text-muted leading-relaxed">{event.description}</p>
                    
                    {event.bannerUrl && (
                      <div className="mt-4">
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Rounds (for hackathons) */}
                {event.type === 'hackathon' && event.metadata?.rounds && (
                  <Card className="card-professional">
                    <CardHeader className="card-header-professional">
                      <CardTitle>Competition Rounds</CardTitle>
                      <CardDescription>
                        Hackathon rounds and scoring system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="card-content-professional">
                      <div className="space-y-4">
                        {event.metadata.rounds.map((round: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="heading-sm">Round {index + 1}: {round.name}</h4>
                              <Badge variant="outline">Max Score: {round.maxScore}</Badge>
                            </div>
                            {round.description && (
                              <p className="text-muted text-sm mb-2">{round.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-subtle">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(round.startAt).toLocaleDateString()}
                              </span>
                              <span>→</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(round.endAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card className="card-professional">
                  <CardHeader className="card-header-professional">
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="card-content-professional space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 mt-0.5 text-subtle" />
                      <div>
                        <div className="text-sm font-medium">Event Period</div>
                        <div className="text-sm text-muted">
                          {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 mt-0.5 text-subtle" />
                      <div>
                        <div className="text-sm font-medium">Registration</div>
                        <div className="text-sm text-muted">
                          {new Date(event.registrationStartAt).toLocaleDateString()} - {new Date(event.registrationEndAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {event.venue && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-0.5 text-subtle" />
                        <div>
                          <div className="text-sm font-medium">Venue</div>
                          <div className="text-sm text-muted">{event.venue}</div>
                        </div>
                      </div>
                    )}

                    {event.maxParticipants && (
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 mt-0.5 text-subtle" />
                        <div>
                          <div className="text-sm font-medium">Capacity</div>
                          <div className="text-sm text-muted">{event.maxParticipants} participants</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 mt-0.5 text-subtle" />
                      <div>
                        <div className="text-sm font-medium">Mode</div>
                        <div className="text-sm text-muted capitalize">{event.mode}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* External Links */}
                {event.externalLinks && event.externalLinks.length > 0 && (
                  <Card className="card-professional">
                    <CardHeader className="card-header-professional">
                      <CardTitle>External Links</CardTitle>
                    </CardHeader>
                    <CardContent className="card-content-professional">
                      <div className="space-y-2">
                        {event.externalLinks.map((link: any, index: number) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 interactive"
                          >
                            <span className="text-sm font-medium">{link.name}</span>
                            <ExternalLink className="w-3 h-3 text-subtle" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <Card className="card-professional">
                    <CardHeader className="card-header-professional">
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="card-content-professional">
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <Card className="card-professional">
              <CardHeader className="card-header-professional">
                <CardTitle>Event Participants</CardTitle>
                <CardDescription>
                  Manage event registrations and participants
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content-professional">
                <div className="text-center py-12 text-muted">
                  <Users className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <p>Participant management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <SubmissionsManager eventId={eventId} event={event} />
          </TabsContent>

          {/* Judging Tab */}
          <TabsContent value="judging" className="space-y-6">
            <JudgingManager eventId={eventId} event={event} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <JudgingManager eventId={eventId} event={event} />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Card className="card-professional">
              <CardHeader className="card-header-professional">
                <CardTitle>Event Announcements</CardTitle>
                <CardDescription>
                  Send announcements to all event participants
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content-professional">
                <div className="text-center py-12 text-muted">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <p>Announcement system coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-professional">
              <CardHeader className="card-header-professional">
                <CardTitle>Event Settings</CardTitle>
                <CardDescription>
                  Configure event preferences and advanced settings
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content-professional">
                <div className="text-center py-12 text-muted">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <p>Event settings coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
