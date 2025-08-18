import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Calendar, MapPin, Users, Clock, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Redirect, useLocation } from "wouter";

const baseEventSchema = z.object({
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
  organizationId: z.string().min(1, "Organization is required")
});

const hackathonSchema = baseEventSchema.extend({
  rounds: z.array(z.object({
    name: z.string().min(1, "Round name is required"),
    description: z.string().optional(),
    startAt: z.string().min(1, "Round start date is required"),
    endAt: z.string().min(1, "Round end date is required"),
    maxScore: z.number().min(1, "Max score must be at least 1").default(100)
  })).min(1, "At least one round is required")
});

type EventFormData = z.infer<typeof baseEventSchema> & {
  rounds?: Array<{
    name: string;
    description?: string;
    startAt: string;
    endAt: string;
    maxScore: number;
  }>;
};

export default function CreateEvent() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("basic");

  const form = useForm<EventFormData>({
    resolver: zodResolver(baseEventSchema),
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
      organizationId: ""
    }
  });

  const [rounds, setRounds] = useState([
    {
      name: "Initial Submission",
      description: "Submit your project idea and initial prototype",
      startAt: "",
      endAt: "",
      maxScore: 100
    }
  ]);

  const eventType = form.watch("type");
  const eventMode = form.watch("mode");

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventPayload = {
        ...data,
        maxParticipants: data.maxParticipants || null,
        metadata: eventType === "hackathon" ? { rounds } : {}
      };
      
      const response = await apiRequest("POST", "/api/events", eventPayload);
      return response.json();
    },
    onSuccess: (event) => {
      toast({
        title: "Event Created Successfully!",
        description: `${event.title} has been created and is ready for participants.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Event",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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

  const onSubmit = (data: EventFormData) => {
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

    createEventMutation.mutate(data);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== "organizer" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need organizer permissions to create events.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg theme-transition">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-space font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Overview</CardTitle>
                    <CardDescription>
                      Provide the basic information about your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} />
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your event, its goals, and what participants can expect"
                              rows={4}
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
                            <FormLabel>Event Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                            <FormLabel>Event Mode *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
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
                          <FormLabel>Banner Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/banner.jpg" {...field} />
                          </FormControl>
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
                    className="bg-light-primary dark:bg-dark-primary"
                  >
                    Next: Event Details
                  </Button>
                </div>
              </TabsContent>

              {/* Event Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Schedule & Location</CardTitle>
                    <CardDescription>
                      Configure when and where your event takes place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="registrationStartAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Opens *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                            <FormLabel>Registration Closes *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                            <FormLabel>Event Starts *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                            <FormLabel>Event Ends *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                            <FormLabel>
                              Venue {eventMode === "offline" ? "*" : "(Optional)"}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter venue address or location" {...field} />
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
                          <FormLabel>Maximum Participants</FormLabel>
                          <FormControl>
                            <Input 
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

                    <FormField
                      control={form.control}
                      name="organizationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select organizing body" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default-org">Default Organization</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep("basic")}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep("advanced")}
                    className="bg-light-primary dark:bg-dark-primary"
                  >
                    Next: Advanced Config
                  </Button>
                </div>
              </TabsContent>

              {/* Advanced Configuration Tab */}
              <TabsContent value="advanced" className="space-y-6">
                {eventType === "hackathon" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hackathon Rounds</CardTitle>
                      <CardDescription>
                        Configure the competition rounds and scoring system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {rounds.map((round, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Round {index + 1}</h4>
                            {rounds.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRound(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Round Name *</label>
                              <Input
                                placeholder="e.g., Initial Submission"
                                value={round.name}
                                onChange={(e) => updateRound(index, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Max Score</label>
                              <Input
                                type="number"
                                value={round.maxScore}
                                onChange={(e) => updateRound(index, "maxScore", parseInt(e.target.value) || 100)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              placeholder="Describe what participants need to submit"
                              value={round.description}
                              onChange={(e) => updateRound(index, "description", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Round Starts *</label>
                              <Input
                                type="datetime-local"
                                value={round.startAt}
                                onChange={(e) => updateRound(index, "startAt", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Round Ends *</label>
                              <Input
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
                        className="w-full"
                      >
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
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending}
                    className="bg-gradient-to-r from-light-primary to-purple-600 dark:from-dark-primary dark:to-teal-500"
                  >
                    {createEventMutation.isPending ? "Creating Event..." : "Create Event"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
