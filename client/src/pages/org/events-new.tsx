import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, Redirect, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Calendar, MapPin, Users, Clock, FileText, Settings, Plus, X } from "lucide-react";

import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  type: z.enum(["hackathon", "conference", "meetup", "fest"]),
  mode: z.enum(["online", "offline", "hybrid"]),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant").optional(),
  registrationStartAt: z.string().min(1, "Registration start date is required"),
  registrationEndAt: z.string().min(1, "Registration end date is required"),
  startAt: z.string().min(1, "Event start date is required"),
  endAt: z.string().min(1, "Event end date is required"),
  venue: z.string().optional(),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  externalLinks: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional()
});

type EventFormData = z.infer<typeof eventSchema> & {
  rounds?: Array<{
    name: string;
    description?: string;
    startAt: string;
    endAt: string;
    maxScore: number;
  }>;
};

export default function OrgEventCreate() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "hackathon",
      mode: "hybrid",
      maxParticipants: undefined,
      registrationStartAt: "",
      registrationEndAt: "",
      startAt: "",
      endAt: "",
      venue: "",
      bannerUrl: "",
      tags: [],
      externalLinks: []
    }
  });

  // Rounds management for hackathons
  const [rounds, setRounds] = useState([
    {
      name: "Initial Submission",
      description: "Submit your project idea and initial prototype",
      startAt: "",
      endAt: "",
      maxScore: 100
    }
  ]);

  // Tags management
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // External links management
  const [externalLinks, setExternalLinks] = useState<{name: string, url: string}[]>([]);
  const [linkInput, setLinkInput] = useState({name: "", url: ""});

  const eventType = form.watch("type");
  const eventMode = form.watch("mode");

  const addRound = () => {
    setRounds([...rounds, {
      name: "",
      description: "",
      startAt: "",
      endAt: "",
      maxScore: 100
    }]);
  };

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter((_, i) => i !== index));
    }
  };

  const updateRound = (index: number, field: string, value: any) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addExternalLink = () => {
    if (linkInput.name.trim() && linkInput.url.trim()) {
      setExternalLinks([...externalLinks, { name: linkInput.name.trim(), url: linkInput.url.trim() }]);
      setLinkInput({name: "", url: ""});
    }
  };

  const removeExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EventFormData) => {
    if (eventType === "hackathon") {
      const invalidRounds = rounds.some(round => 
        !round.name || !round.startAt || !round.endAt
      );
      
      if (invalidRounds) {
        toast({
          title: "Invalid Round Configuration",
          description: "Please fill in all required round fields.",
          variant: "destructive"
        });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...data,
        organizationId: orgId,
        status: 'draft',
        tags,
        externalLinks,
        metadata: eventType === "hackathon" ? { rounds } : {}
      };
      
      const res = await apiRequest('POST', '/api/events', payload);
      const json = await res.json();
      
      // Invalidate organization events cache to show the new event immediately
      // This will invalidate all queries that start with ["/api/orgs", orgId, "events"]
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/orgs", orgId, "events"]
      });
      
      // Force refetch of the events list to ensure immediate update
      await queryClient.refetchQueries({ 
        queryKey: ["/api/orgs", orgId, "events"],
        type: 'active'
      });
      
      toast({
        title: "Event Created Successfully!",
        description: `${data.title} has been saved as draft.`
      });
      
      setCreatedId(json.id);
    } catch (error) {
      toast({
        title: "Failed to Create Event",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (createdId) return <Redirect to={`/org/${orgId}/events`} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-5xl mx-auto container-padding section-spacing">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="heading-xl">Create New Event</h1>
            <Link href={`/org/${orgId}/events`}>
              <Button variant="outline" size="sm">← Back to Events</Button>
            </Link>
          </div>
          <p className="text-muted">
            Set up your hackathon, conference, meetup, or fest to engage your community
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={currentStep} onValueChange={setCurrentStep}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Event Details</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Advanced Config</span>
                </TabsTrigger>
              </TabsList>

              {/* Step 1: Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                <Card className="card-professional">
                  <CardHeader className="card-header-professional">
                    <CardTitle>Event Overview</CardTitle>
                    <CardDescription>
                      Provide the basic information about your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="card-content-professional space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Event Title *</FormLabel>
                          <FormControl>
                            <Input className="form-input" placeholder="Enter event title" {...field} />
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
                          <FormLabel className="form-label">Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="form-input min-h-[120px]"
                              placeholder="Describe your event, its goals, and what participants can expect"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Event Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hackathon">🏆 Hackathon</SelectItem>
                                <SelectItem value="conference">🎤 Conference</SelectItem>
                                <SelectItem value="meetup">👥 Meetup</SelectItem>
                                <SelectItem value="fest">🎪 Fest</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Event Mode *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-input">
                                  <SelectValue placeholder="Select event mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="online">🌐 Online</SelectItem>
                                <SelectItem value="offline">📍 In-Person</SelectItem>
                                <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bannerUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Banner Image URL</FormLabel>
                          <FormControl>
                            <Input className="form-input" placeholder="https://example.com/banner.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Optional: Add a banner image for your event</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep("details")}
                    className="btn-primary"
                  >
                    Next: Event Details
                  </Button>
                </div>
              </TabsContent>

              {/* Step 2: Event Details */}
              <TabsContent value="details" className="space-y-6">
                <Card className="card-professional">
                  <CardHeader className="card-header-professional">
                    <CardTitle>Event Schedule & Location</CardTitle>
                    <CardDescription>
                      Configure when and where your event takes place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="card-content-professional space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="registrationStartAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Registration Opens *</FormLabel>
                            <FormControl>
                              <Input className="form-input" type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="registrationEndAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Registration Closes *</FormLabel>
                            <FormControl>
                              <Input className="form-input" type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Event Starts *</FormLabel>
                            <FormControl>
                              <Input className="form-input" type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Event Ends *</FormLabel>
                            <FormControl>
                              <Input className="form-input" type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {(eventMode === "offline" || eventMode === "hybrid") && (
                      <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">
                              Venue {eventMode === "offline" ? "*" : "(Optional)"}
                            </FormLabel>
                            <FormControl>
                              <Input className="form-input" placeholder="Enter venue address or location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Maximum Participants</FormLabel>
                          <FormControl>
                            <Input 
                              className="form-input"
                              type="number" 
                              placeholder="Leave empty for unlimited"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags Section */}
                    <div>
                      <label className="form-label block mb-2">Event Tags</label>
                      <div className="flex gap-2 mb-3">
                        <Input 
                          className="form-input flex-1"
                          placeholder="Add a tag (e.g., Web3, AI, Mobile)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* External Links Section */}
                    <div>
                      <label className="form-label block mb-2">External Links</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <Input 
                          className="form-input"
                          placeholder="Link name (e.g., Discord)"
                          value={linkInput.name}
                          onChange={(e) => setLinkInput({...linkInput, name: e.target.value})}
                        />
                        <Input 
                          className="form-input"
                          placeholder="https://..."
                          value={linkInput.url}
                          onChange={(e) => setLinkInput({...linkInput, url: e.target.value})}
                        />
                        <Button type="button" variant="outline" onClick={addExternalLink}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {externalLinks.map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm">{link.name}: {link.url}</span>
                            <X className="w-4 h-4 cursor-pointer text-gray-500" onClick={() => removeExternalLink(index)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep("basic")}
                    className="btn-outline"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep("advanced")}
                    className="btn-primary"
                  >
                    Next: Advanced Config
                  </Button>
                </div>
              </TabsContent>

              {/* Step 3: Advanced Configuration */}
              <TabsContent value="advanced" className="space-y-6">
                {eventType === "hackathon" && (
                  <Card className="card-professional">
                    <CardHeader className="card-header-professional">
                      <CardTitle>Hackathon Rounds</CardTitle>
                      <CardDescription>
                        Configure the competition rounds and scoring system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="card-content-professional space-y-6">
                      {rounds.map((round, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="heading-sm">Round {index + 1}</h4>
                            {rounds.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRound(index)}
                                className="btn-outline"
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="form-label">Round Name *</label>
                              <Input
                                className="form-input"
                                placeholder="e.g., Initial Submission"
                                value={round.name}
                                onChange={(e) => updateRound(index, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="form-label">Max Score</label>
                              <Input
                                className="form-input"
                                type="number"
                                value={round.maxScore}
                                onChange={(e) => updateRound(index, "maxScore", parseInt(e.target.value) || 100)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="form-label">Description</label>
                            <Textarea
                              className="form-input"
                              placeholder="Describe what participants need to submit"
                              value={round.description}
                              onChange={(e) => updateRound(index, "description", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="form-label">Round Starts *</label>
                              <Input
                                className="form-input"
                                type="datetime-local"
                                value={round.startAt}
                                onChange={(e) => updateRound(index, "startAt", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="form-label">Round Ends *</label>
                              <Input
                                className="form-input"
                                type="datetime-local"
                                value={round.endAt}
                                onChange={(e) => updateRound(index, "endAt", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addRound}
                        className="w-full btn-outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Round
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep("details")}
                    className="btn-outline"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? "Saving Event..." : "Save as Draft"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </main>
    </div>
  );
}
