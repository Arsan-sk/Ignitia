import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  UserCheck, Plus, X, Star, Users, Trophy, BarChart3, 
  Settings, Save, Eye, FileText, Clock, Award
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JudgingManagerProps {
  eventId: string;
  event: any;
}

export default function JudgingManager({ eventId, event }: JudgingManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("judges");
  const [addJudgeDialogOpen, setAddJudgeDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [judgeEmail, setJudgeEmail] = useState("");
  const [scores, setScores] = useState<{[key: string]: number}>({});
  const [comments, setComments] = useState("");

  const { data: judges, isLoading: judgesLoading } = useQuery({
    queryKey: ["/api/events", eventId, "judges"],
    enabled: !!eventId
  });

  const { data: rubrics } = useQuery({
    queryKey: ["/api/events", eventId, "rubrics"],
    enabled: !!eventId
  });

  const { data: submissions } = useQuery({
    queryKey: ["/api/events", eventId, "submissions"],
    enabled: !!eventId && activeTab === "scoring"
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/events", eventId, "leaderboard"],
    enabled: !!eventId && activeTab === "leaderboard"
  });

  const addJudgeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/judges`, { email });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "judges"] });
      setAddJudgeDialogOpen(false);
      setJudgeEmail("");
      toast({ title: "Judge added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add judge",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const removeJudgeMutation = useMutation({
    mutationFn: async (judgeId: string) => {
      const response = await apiRequest("DELETE", `/api/events/${eventId}/judges/${judgeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "judges"] });
      toast({ title: "Judge removed successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove judge",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const updateRubricsMutation = useMutation({
    mutationFn: async (rubrics: any) => {
      const response = await apiRequest("PUT", `/api/events/${eventId}/rubrics`, { rubrics });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "rubrics"] });
      toast({ title: "Rubrics updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update rubrics",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async ({ submissionId, scores, comments }: { submissionId: string; scores: any; comments: string }) => {
      const response = await apiRequest("POST", `/api/submissions/${submissionId}/scores`, {
        scores,
        comments
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "leaderboard"] });
      setScoreDialogOpen(false);
      setScores({});
      setComments("");
      toast({ title: "Score submitted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit score",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const recalculateLeaderboardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/events/${eventId}/leaderboard/recalculate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "leaderboard"] });
      toast({ title: "Leaderboard recalculated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to recalculate leaderboard",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const defaultRubrics = [
    { name: "Technical Implementation", weight: 30, maxPoints: 10 },
    { name: "Innovation & Creativity", weight: 25, maxPoints: 10 },
    { name: "Code Quality", weight: 20, maxPoints: 10 },
    { name: "Presentation", weight: 15, maxPoints: 10 },
    { name: "Problem Solving", weight: 10, maxPoints: 10 }
  ];

  const currentRubrics = rubrics || defaultRubrics;

  const handleScoreSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setScores({});
    setComments("");
    setScoreDialogOpen(true);
  };

  const calculateTotalScore = () => {
    return currentRubrics.reduce((total, rubric) => {
      const score = scores[rubric.name] || 0;
      return total + (score * rubric.weight / 100);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="judges" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Judges
          </TabsTrigger>
          <TabsTrigger value="rubrics" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Rubrics
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Judges Tab */}
        <TabsContent value="judges" className="space-y-6">
          <Card className="card-professional">
            <CardHeader className="card-header-professional">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Judge Management</CardTitle>
                  <CardDescription>
                    Add and manage judges for this event
                  </CardDescription>
                </div>
                <Dialog open={addJudgeDialogOpen} onOpenChange={setAddJudgeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Judge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Judge</DialogTitle>
                      <DialogDescription>
                        Invite a judge by their email address
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="judgeEmail">Email Address</Label>
                        <Input
                          id="judgeEmail"
                          type="email"
                          placeholder="judge@example.com"
                          value={judgeEmail}
                          onChange={(e) => setJudgeEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddJudgeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => addJudgeMutation.mutate(judgeEmail)}
                        disabled={!judgeEmail || addJudgeMutation.isPending}
                        className="btn-primary"
                      >
                        Add Judge
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="card-content-professional">
              {judgesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : judges && judges.length > 0 ? (
                <div className="space-y-4">
                  {judges.map((judge: any) => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="heading-sm">{judge.name}</h4>
                          <p className="text-sm text-muted">{judge.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {judge.assignedRounds?.length || 0} rounds
                            </Badge>
                            <Badge className="badge-info">
                              {judge.status || 'invited'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeJudgeMutation.mutate(judge.id)}
                        disabled={removeJudgeMutation.isPending}
                        className="btn-danger"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <h3 className="heading-sm mb-2">No Judges Added</h3>
                  <p className="mb-4">Add judges to start the evaluation process</p>
                  <Button 
                    onClick={() => setAddJudgeDialogOpen(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Judge
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rubrics Tab */}
        <TabsContent value="rubrics" className="space-y-6">
          <Card className="card-professional">
            <CardHeader className="card-header-professional">
              <CardTitle>Scoring Rubrics</CardTitle>
              <CardDescription>
                Define criteria and weights for judging submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-professional">
              <div className="space-y-6">
                <div className="space-y-4">
                  {currentRubrics.map((rubric, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{rubric.name}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted">Weight:</Label>
                        <div className="w-16">
                          <Input
                            type="number"
                            value={rubric.weight}
                            className="text-xs h-8"
                            min="0"
                            max="100"
                            readOnly
                          />
                        </div>
                        <span className="text-xs text-muted">%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted">Max:</Label>
                        <div className="w-16">
                          <Input
                            type="number"
                            value={rubric.maxPoints}
                            className="text-xs h-8"
                            min="1"
                            max="100"
                            readOnly
                          />
                        </div>
                        <span className="text-xs text-muted">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted">
                    Total weight: {currentRubrics.reduce((sum, r) => sum + r.weight, 0)}%
                  </div>
                  <Button
                    onClick={() => updateRubricsMutation.mutate(currentRubrics)}
                    disabled={updateRubricsMutation.isPending}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Rubrics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <Card className="card-professional">
            <CardHeader className="card-header-professional">
              <CardTitle>Score Submissions</CardTitle>
              <CardDescription>
                Evaluate and score participant submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-professional">
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission: any) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="heading-sm">
                            {submission.teamName || `Team ${submission.teamId}`}
                          </h4>
                          <Badge className={submission.status === 'approved' ? 'badge-success' : 'badge-info'}>
                            {submission.status}
                          </Badge>
                          {submission.roundNumber && (
                            <Badge variant="outline">
                              Round {submission.roundNumber}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {submission.memberCount || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          {submission.averageScore && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {submission.averageScore.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.githubUrl, '_blank')}
                            className="btn-outline"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleScoreSubmission(submission)}
                          className="btn-primary"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Score
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted">
                  <Star className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <h3 className="heading-sm mb-2">No Submissions to Score</h3>
                  <p>Submissions will appear here once participants start submitting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="card-professional">
            <CardHeader className="card-header-professional">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Event Leaderboard</CardTitle>
                  <CardDescription>
                    Rankings based on judge scores and evaluation
                  </CardDescription>
                </div>
                <Button
                  onClick={() => recalculateLeaderboardMutation.mutate()}
                  disabled={recalculateLeaderboardMutation.isPending}
                  className="btn-secondary"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="card-content-professional">
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry: any, index: number) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="heading-sm">{entry.teamName}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Score: {entry.totalScore?.toFixed(1) || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {entry.memberCount || 0} members
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={index < 3 ? 'badge-warning' : 'badge-secondary'}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-subtle" />
                  <h3 className="heading-sm mb-2">No Rankings Yet</h3>
                  <p>Rankings will appear once judges start scoring submissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scoring Dialog */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Score Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.teamName || `Team ${selectedSubmission?.teamId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              {currentRubrics.map((rubric) => (
                <div key={rubric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{rubric.name}</Label>
                    <span className="text-xs text-muted">Weight: {rubric.weight}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={rubric.maxPoints}
                      step="0.1"
                      value={scores[rubric.name] || ""}
                      onChange={(e) => setScores(prev => ({
                        ...prev,
                        [rubric.name]: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted">/ {rubric.maxPoints}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Score:</span>
                <span className="text-lg font-bold">
                  {calculateTotalScore().toFixed(1)} / 10
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Provide feedback and comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitScoreMutation.mutate({
                submissionId: selectedSubmission?.id,
                scores,
                comments
              })}
              disabled={submitScoreMutation.isPending}
              className="btn-primary"
            >
              <Star className="w-4 h-4 mr-2" />
              Submit Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
