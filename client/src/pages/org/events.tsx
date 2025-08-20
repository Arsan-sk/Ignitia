import { useParams, Link } from "wouter";
import { useState } from "react";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, Copy, Archive, Edit, Eye, Users, Calendar, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrgEventsList() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery({ 
    queryKey: ["/api/orgs", orgId, "events", { status: statusFilter, type: typeFilter, q: searchTerm }], 
    enabled: !!orgId 
  });

  const duplicateEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/duplicate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orgs", orgId, "events"] });
      toast({
        title: "Event Duplicated",
        description: "Event has been duplicated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Duplicate Event",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const archiveEventMutation = useMutation({
    mutationFn: async ({ eventId, archived }: { eventId: string; archived: boolean }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/archive`, { archived });
      return response.json();
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orgs", orgId, "events"] });
      toast({
        title: archived ? "Event Archived" : "Event Restored",
        description: `Event has been ${archived ? 'archived' : 'restored'} successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Event",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  // Filter events based on search and filters
  const filteredEvents = (data as any[])?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getEventStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.startAt);
    const endDate = new Date(event.endAt);
    const regStartDate = new Date(event.registrationStartAt || event.startAt);
    const regEndDate = new Date(event.registrationEndAt || event.startAt);

    // Check actual timing vs stored status
    if (now < regStartDate) {
      return { status: 'upcoming', label: 'Upcoming', style: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    } else if (now >= regStartDate && now <= regEndDate && event.status === 'published') {
      return { status: 'registration-open', label: 'Registration Open', style: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    } else if (now > regEndDate && now < startDate) {
      return { status: 'registration-closed', label: 'Registration Closed', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', label: 'Ongoing', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    } else if (now > endDate) {
      return { status: 'completed', label: 'Completed', style: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
    } else if (event.status === 'draft') {
      return { status: 'draft', label: 'Draft', style: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    } else if (event.status === 'archived') {
      return { status: 'archived', label: 'Archived', style: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
    }
    
    return { status: event.status, label: event.status, style: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-xl">Events</h1>
            <p className="text-muted mt-1">
              Manage your organization's events and competitions
            </p>
          </div>
          <Link href={`/org/${orgId}/events/new`}>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              className="form-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-input">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] form-input">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="fest">Fest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="card-professional animate-pulse">
                <CardHeader className="card-header-professional">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
                <CardContent className="card-content-professional">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Link key={event.id} href={`/org/${orgId}/events/${event.id}`}>
                <Card className="card-professional card-hover cursor-pointer">
                <CardHeader className="card-header-professional">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="heading-sm flex items-center gap-2">
                        <span>{getTypeIcon(event.type)}</span>
                        <span className="truncate">{event.title}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getEventStatus(event).style}>
                          {getEventStatus(event).label}
                        </Badge>
                        <span className="text-subtle text-xs capitalize">{event.type}</span>
                        {event.participantCount && (
                          <span className="text-subtle text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.participantCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="focus-ring">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/org/${orgId}/events/${event.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Event
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => duplicateEventMutation.mutate(event.id)}
                          disabled={duplicateEventMutation.isPending}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => archiveEventMutation.mutate({ eventId: event.id, archived: event.status !== 'archived' })}
                          disabled={archiveEventMutation.isPending}
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          {event.status === 'archived' ? 'Restore' : 'Archive'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="card-content-professional">
                  <p className="text-muted text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-xs text-subtle">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.startAt).toLocaleDateString()}</span>
                      <span className="mx-1">—</span>
                      <span>{new Date(event.endAt).toLocaleDateString()}</span>
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                    
                    {event.maxParticipants && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Max {event.maxParticipants} participants</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))
          ) : (
            <Card className="col-span-full card-professional border-dashed border-2">
              <CardContent className="card-content-professional py-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="heading-sm mb-2">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? 
                    "No events match your filters" : 
                    "No events yet"
                  }
                </h3>
                <p className="text-muted mb-6">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? 
                    "Try adjusting your search or filters" : 
                    "Create your first event to get started"
                  }
                </p>
                {(!searchTerm && statusFilter === "all" && typeFilter === "all") && (
                  <Link href={`/org/${orgId}/events/new`}>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Results count */}
        {!isLoading && (searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
          <div className="mt-6 text-center text-subtle text-sm">
            Showing {filteredEvents.length} of {(data as any[])?.length || 0} events
          </div>
        )}
      </main>
    </div>
  );
}
