import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, Plus, MoreVertical, UserPlus, UserMinus, Crown, Mail, 
  Search, Filter, Download, Upload, Copy, Trash2, Eye, Edit
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const teamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name must be less than 50 characters"),
  description: z.string().optional(),
  maxMembers: z.number().min(1, "Team must allow at least 1 member").max(10, "Team cannot have more than 10 members").default(4),
  isOpen: z.boolean().default(true)
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamsManagementProps {
  eventId: string;
  eventType: string;
}

export default function TeamsManagement({ eventId, eventType }: TeamsManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all-teams");

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      maxMembers: 4,
      isOpen: true
    }
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ["/api/events", eventId, "teams"],
    enabled: !!eventId
  });

  const { data: registrations } = useQuery({
    queryKey: ["/api/events", eventId, "registrations"],
    enabled: !!eventId
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const response = await apiRequest("POST", "/api/teams", {
        ...data,
        eventId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "teams"] });
      toast({ title: "Team created successfully" });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create team",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ teamId, ...data }: { teamId: string } & Partial<TeamFormData>) => {
      const response = await apiRequest("PATCH", `/api/teams/${teamId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "teams"] });
      toast({ title: "Team updated successfully" });
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const response = await apiRequest("DELETE", `/api/teams/${teamId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "teams"] });
      toast({ title: "Team deleted successfully" });
    }
  });

  const manageMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId, action }: { teamId: string; userId: string; action: "add" | "remove" | "promote" | "demote" }) => {
      const response = await apiRequest("PATCH", `/api/teams/${teamId}/members`, {
        userId,
        action
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "teams"] });
      toast({ title: "Team member updated successfully" });
    }
  });

  const filteredTeams = (teams as any[])?.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "open" && team.isOpen && team.memberCount < team.maxMembers) ||
      (statusFilter === "closed" && (!team.isOpen || team.memberCount >= team.maxMembers)) ||
      (statusFilter === "full" && team.memberCount >= team.maxMembers);
    return matchesSearch && matchesStatus;
  }) || [];

  const unassignedParticipants = (registrations as any[])?.filter(reg => !reg.teamId) || [];

  const onSubmit = (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };

  const getTeamStatusBadge = (team: any) => {
    if (team.memberCount >= team.maxMembers) {
      return <Badge className="badge-danger">Full</Badge>;
    }
    if (!team.isOpen) {
      return <Badge className="badge-warning">Closed</Badge>;
    }
    return <Badge className="badge-success">Open</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="heading-lg">Team Management</h2>
          <p className="text-muted">Manage teams and participants for this event</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Set up a new team for this event
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the team's focus or goals"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Members</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 4)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTeamMutation.isPending}
                      className="btn-primary"
                    >
                      {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export Teams
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import Teams
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-teams">All Teams ({filteredTeams.length})</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned ({unassignedParticipants.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Teams Tab */}
        <TabsContent value="all-teams" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-subtle" />
                <Input
                  className="pl-9 form-input"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] form-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="card-professional animate-pulse">
                  <CardHeader className="card-header-professional">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent className="card-content-professional">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <Card key={team.id} className="card-professional">
                  <CardHeader className="card-header-professional">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="heading-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {team.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getTeamStatusBadge(team)}
                          <Badge variant="outline">
                            {team.memberCount}/{team.maxMembers} members
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="focus-ring">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Invite Link
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTeamMutation.mutate(team.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="card-content-professional">
                    {team.description && (
                      <p className="text-muted text-sm mb-4 line-clamp-2">{team.description}</p>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-subtle">Team Leader:</span>
                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">{team.leader?.name || "None"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-subtle">Invite Code:</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {team.inviteCode}
                        </code>
                      </div>
                      
                      {team.members && team.members.length > 0 && (
                        <div>
                          <span className="text-subtle text-sm block mb-2">Members:</span>
                          <div className="flex flex-wrap gap-1">
                            {team.members.slice(0, 3).map((member: any) => (
                              <Badge key={member.id} variant="secondary" className="text-xs">
                                {member.name}
                              </Badge>
                            ))}
                            {team.members.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{team.members.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full card-professional border-dashed border-2">
                <CardContent className="card-content-professional py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <h3 className="heading-sm mb-2">No teams found</h3>
                  <p className="text-muted mb-6">
                    {searchTerm || statusFilter !== "all" ? 
                      "Try adjusting your search or filters" : 
                      "Create the first team to get started"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Unassigned Participants Tab */}
        <TabsContent value="unassigned" className="space-y-6">
          <Card className="card-professional">
            <CardHeader className="card-header-professional">
              <CardTitle>Unassigned Participants</CardTitle>
              <CardDescription>
                Participants who haven't joined a team yet
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-professional">
              {unassignedParticipants.length > 0 ? (
                <div className="space-y-4">
                  {unassignedParticipants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {participant.user?.firstName?.[0]}{participant.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{participant.user?.firstName} {participant.user?.lastName}</div>
                          <div className="text-sm text-muted">{participant.user?.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Invite to Team
                        </Button>
                        <Button size="sm" className="btn-primary">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign Team
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <p className="text-muted">All participants have been assigned to teams</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-professional">
              <CardContent className="card-content-professional py-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{teams?.length || 0}</div>
                <div className="text-sm text-muted">Total Teams</div>
              </CardContent>
            </Card>
            
            <Card className="card-professional">
              <CardContent className="card-content-professional py-6 text-center">
                <UserPlus className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{registrations?.length || 0}</div>
                <div className="text-sm text-muted">Total Participants</div>
              </CardContent>
            </Card>
            
            <Card className="card-professional">
              <CardContent className="card-content-professional py-6 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">
                  {Math.round(((registrations?.length || 0) - unassignedParticipants.length) / (registrations?.length || 1) * 100)}%
                </div>
                <div className="text-sm text-muted">Assignment Rate</div>
              </CardContent>
            </Card>
            
            <Card className="card-professional">
              <CardContent className="card-content-professional py-6 text-center">
                <Filter className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">
                  {teams?.filter((team: any) => team.memberCount >= team.maxMembers).length || 0}
                </div>
                <div className="text-sm text-muted">Full Teams</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
